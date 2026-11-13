// Cálculo de promedios ponderados por grupo.
document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("selectGrupo");
    obtenerGrupos().forEach(grupo => {
        const op=document.createElement("option"); op.value=grupo.id; op.textContent=`${grupo.nombre} — ${grupo.materia}`; select.appendChild(op);
    });
    select.addEventListener("change", mostrarEvaluacion);
    document.getElementById("notaMinima").addEventListener("input", mostrarEvaluacion);
    document.getElementById("btnActualizar").addEventListener("click", mostrarEvaluacion);
    if (select.options.length===1) mensaje("Primero debe registrar un grupo en la sección Grupos.", "aviso");
});

function mostrarEvaluacion() {
    const grupoId=document.getElementById("selectGrupo").value;
    const grupo=obtenerGrupos().find(g=>g.id===grupoId);
    const pesos=document.getElementById("seccionPesos"), resultados=document.getElementById("seccionResultados");
    if (!grupo) { pesos.hidden=true; resultados.hidden=true; return; }
    pesos.hidden=false; resultados.hidden=false;
    const cotidiano=Number(grupo.cotidiano)||0, tareas=Number(grupo.tareas)||0, examenes=Number(grupo.examenes)||0;
    document.getElementById("pesoCotidiano").textContent=`${cotidiano}%`;
    document.getElementById("pesoTareas").textContent=`${tareas}%`;
    document.getElementById("pesoExamenes").textContent=`${examenes}%`;
    const pesosValidos=Math.abs(cotidiano+tareas+examenes-100)<0.001;
    document.getElementById("validacionPesos").textContent=pesosValidos ? "La distribución suma 100%." : "Advertencia: los porcentajes de este grupo no suman 100%. Edite el grupo para corregirlos.";
    const estudiantes=obtenerEstudiantesPorGrupo(grupoId), tbody=document.getElementById("tablaEvaluacion"); tbody.innerHTML="";
    const todasNotas=obtenerCalificacionesPorGrupo(grupoId);
    document.getElementById("sinEstudiantes").hidden=estudiantes.length>0;
    document.getElementById("sinNotas").hidden=estudiantes.length===0 || todasNotas.length>0;
    estudiantes.forEach(estudiante=>{
        const notas=todasNotas.filter(n=>n.estudianteId===estudiante.id);
        const promedio=(categoria)=>{
            const lista=notas.filter(n=>n.categoria===categoria && Number.isFinite(Number(n.nota)));
            if (!lista.length) return null;
            return lista.reduce((s,n)=>s+Number(n.nota),0)/lista.length;
        };
        const c=promedio("cotidiano"), t=promedio("tareas"), e=promedio("examenes");
        const completo=c!==null && t!==null && e!==null && pesosValidos;
        const final=completo ? c*(cotidiano/100)+t*(tareas/100)+e*(examenes/100) : null;
        const minimo=Number(document.getElementById("notaMinima").value);
        const estado=final===null ? "Evaluación incompleta" : final>=minimo ? "Aprobado" : "Reprobado";
        const fila=document.createElement("tr");
        [ `${estudiante.nombre} ${estudiante.apellido}`, formato(c), formato(t), formato(e), final===null ? "Pendiente" : final.toFixed(2), estado ].forEach((v,i)=>{
            const td=document.createElement("td"); td.textContent=v;
            if(i===5 && final!==null) td.className=final>=minimo ? "mensaje-exito" : "mensaje-error";
            fila.appendChild(td);
        });
        tbody.appendChild(fila);
    });
    mensaje(todasNotas.length ? `Se analizaron ${todasNotas.length} calificación(es) del grupo.` : "No hay calificaciones ingresadas para este grupo.", todasNotas.length ? "exito" : "aviso");
}
function formato(valor) { return valor===null ? "Pendiente" : valor.toFixed(2); }
function mensaje(texto,tipo="exito") { const el=document.getElementById("mensajeGeneral"); el.textContent=texto; el.className=tipo==="aviso" ? "mensaje-aviso" : "mensaje-exito"; }
