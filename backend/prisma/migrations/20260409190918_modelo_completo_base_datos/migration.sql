-- CreateEnum
CREATE TYPE "TipoRol" AS ENUM ('ADMINISTRADOR', 'PROFESOR', 'AYUDANTE', 'ESTUDIANTE', 'SOLICITANTE');

-- CreateEnum
CREATE TYPE "EstadoSemestre" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoAyudantia" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "EstadoAsistenciaAyudantia" AS ENUM ('ASISTIO', 'FALTO', 'JUSTIFICO');

-- CreateEnum
CREATE TYPE "EstadoImpresion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoMovimientoStock" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passUsuario" TEXT NOT NULL,
    "usuarioRol" "TipoRol" NOT NULL DEFAULT 'SOLICITANTE',
    "borradoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semestre" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "periodo" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoSemestre" NOT NULL DEFAULT 'ACTIVO',
    "borradoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semestre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articulo" (
    "id" TEXT NOT NULL,
    "nombreArticulo" TEXT NOT NULL,
    "stockActual" INTEGER,
    "unidadMedida" TEXT NOT NULL,
    "alertaStock" INTEGER,
    "notificarStock" BOOLEAN,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Articulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueHorario" (
    "id" TEXT NOT NULL,
    "nroBloque" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,

    CONSTRAINT "BloqueHorario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "refSemestre" TEXT NOT NULL,
    "refProfesor" TEXT NOT NULL,
    "borradoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstudianteCurso" (
    "refCurso" TEXT NOT NULL,
    "refEstudiante" TEXT NOT NULL,

    CONSTRAINT "EstudianteCurso_pkey" PRIMARY KEY ("refCurso","refEstudiante")
);

-- CreateTable
CREATE TABLE "GrupoCurso" (
    "id" TEXT NOT NULL,
    "refCurso" TEXT NOT NULL,
    "nombreGrupo" TEXT NOT NULL,

    CONSTRAINT "GrupoCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoEstudiante" (
    "refGrupo" TEXT NOT NULL,
    "refEstudiante" TEXT NOT NULL,

    CONSTRAINT "GrupoEstudiante_pkey" PRIMARY KEY ("refGrupo","refEstudiante")
);

-- CreateTable
CREATE TABLE "Ayudantia" (
    "id" TEXT NOT NULL,
    "nombreAyudantia" TEXT NOT NULL,
    "refCurso" TEXT NOT NULL,
    "refGrupo" TEXT,
    "refAyudante" TEXT NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL,
    "cupoMaximo" INTEGER NOT NULL,
    "estado" "EstadoAyudantia" NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "Ayudantia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscripcionAyudantia" (
    "refAyudantia" TEXT NOT NULL,
    "refEstudiante" TEXT NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoAsistenciaAyudantia" NOT NULL DEFAULT 'ASISTIO',

    CONSTRAINT "InscripcionAyudantia_pkey" PRIMARY KEY ("refAyudantia","refEstudiante")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "fechaReserva" TIMESTAMP(3) NOT NULL,
    "estadoReserva" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "solicitanteNombre" TEXT NOT NULL,
    "solicitanteApellido" TEXT NOT NULL,
    "solicitanteCorreo" TEXT NOT NULL,
    "solicitanteRut" TEXT NOT NULL,
    "refAyudante" TEXT,
    "motivoReserva" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Impresion" (
    "id" TEXT NOT NULL,
    "solicitanteNombre" TEXT,
    "solicitanteApellido" TEXT,
    "solicitanteCorreo" TEXT,
    "solicitanteRut" TEXT,
    "refEstudiante" TEXT,
    "refAyudante" TEXT,
    "tipoUsuario" TEXT,
    "tipoSolicitud" TEXT,
    "nombreCurso" TEXT,
    "refCurso" TEXT,
    "colorOpcion1" TEXT NOT NULL,
    "colorOpcion2" TEXT NOT NULL,
    "colorOpcion3" TEXT NOT NULL,
    "comentarioTecnico" TEXT,
    "urlModelo3d" TEXT NOT NULL,
    "urlModeloStl" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "estado" "EstadoImpresion" NOT NULL DEFAULT 'PENDIENTE',
    "observacionAyudante" TEXT,
    "motivoRechazo" TEXT,
    "tiempoEstimadoImpresion" TEXT,
    "inicioImpresion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Impresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" TEXT NOT NULL,
    "refArticulo" TEXT NOT NULL,
    "refUsuario" TEXT NOT NULL,
    "tipoMovimiento" "TipoMovimientoStock" NOT NULL,
    "cambioStock" INTEGER NOT NULL,
    "stockResultante" INTEGER NOT NULL,
    "observacion" TEXT,
    "creadoEn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsoImpresion" (
    "id" TEXT NOT NULL,
    "refImpresion" TEXT NOT NULL,
    "refSolicitante" TEXT,
    "refEstudiante" TEXT,
    "refSemestre" TEXT NOT NULL,
    "cantidadFilamento" INTEGER NOT NULL,
    "refArticulo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3),

    CONSTRAINT "UsoImpresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueReservado" (
    "bloqueId" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,

    CONSTRAINT "BloqueReservado_pkey" PRIMARY KEY ("bloqueId","reservaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rut_key" ON "Usuario"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_refSemestre_fkey" FOREIGN KEY ("refSemestre") REFERENCES "Semestre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_refProfesor_fkey" FOREIGN KEY ("refProfesor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudianteCurso" ADD CONSTRAINT "EstudianteCurso_refCurso_fkey" FOREIGN KEY ("refCurso") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudianteCurso" ADD CONSTRAINT "EstudianteCurso_refEstudiante_fkey" FOREIGN KEY ("refEstudiante") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoCurso" ADD CONSTRAINT "GrupoCurso_refCurso_fkey" FOREIGN KEY ("refCurso") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoEstudiante" ADD CONSTRAINT "GrupoEstudiante_refGrupo_fkey" FOREIGN KEY ("refGrupo") REFERENCES "GrupoCurso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoEstudiante" ADD CONSTRAINT "GrupoEstudiante_refEstudiante_fkey" FOREIGN KEY ("refEstudiante") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ayudantia" ADD CONSTRAINT "Ayudantia_refCurso_fkey" FOREIGN KEY ("refCurso") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ayudantia" ADD CONSTRAINT "Ayudantia_refGrupo_fkey" FOREIGN KEY ("refGrupo") REFERENCES "GrupoCurso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ayudantia" ADD CONSTRAINT "Ayudantia_refAyudante_fkey" FOREIGN KEY ("refAyudante") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionAyudantia" ADD CONSTRAINT "InscripcionAyudantia_refAyudantia_fkey" FOREIGN KEY ("refAyudantia") REFERENCES "Ayudantia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionAyudantia" ADD CONSTRAINT "InscripcionAyudantia_refEstudiante_fkey" FOREIGN KEY ("refEstudiante") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_refAyudante_fkey" FOREIGN KEY ("refAyudante") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impresion" ADD CONSTRAINT "Impresion_refEstudiante_fkey" FOREIGN KEY ("refEstudiante") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impresion" ADD CONSTRAINT "Impresion_refAyudante_fkey" FOREIGN KEY ("refAyudante") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impresion" ADD CONSTRAINT "Impresion_refCurso_fkey" FOREIGN KEY ("refCurso") REFERENCES "Curso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_refArticulo_fkey" FOREIGN KEY ("refArticulo") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_refUsuario_fkey" FOREIGN KEY ("refUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoImpresion" ADD CONSTRAINT "UsoImpresion_refImpresion_fkey" FOREIGN KEY ("refImpresion") REFERENCES "Impresion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoImpresion" ADD CONSTRAINT "UsoImpresion_refSolicitante_fkey" FOREIGN KEY ("refSolicitante") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoImpresion" ADD CONSTRAINT "UsoImpresion_refEstudiante_fkey" FOREIGN KEY ("refEstudiante") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoImpresion" ADD CONSTRAINT "UsoImpresion_refSemestre_fkey" FOREIGN KEY ("refSemestre") REFERENCES "Semestre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoImpresion" ADD CONSTRAINT "UsoImpresion_refArticulo_fkey" FOREIGN KEY ("refArticulo") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueReservado" ADD CONSTRAINT "BloqueReservado_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "BloqueHorario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueReservado" ADD CONSTRAINT "BloqueReservado_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
