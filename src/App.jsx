// src/App.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  HeartHandshake,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { apiTraficoPiso } from "./lib/traficoPisoApi";

// ─── CONSTANTES ───
const AGENCIAS = ["Volvo"];
const ASESORES = [
  "Enrique Vazquez Islas",
  "Ricardo Platas",
  "Verónica Del Rayo Galindo León",
  "Julio Camacho Barragán",
  "Fernanda Romero Aguilar",
];
const VEHICULOS = [
  "EX30", "EX40", "EC40", "EX90", "XC60", "XC90",
  "XC60 Black Edition", "XC90 Black Edition", "Seminuevos", "Avalúo",
];
const MOTIVOS_INGRESO = [
  "Vi anuncios en redes sociales",
  "Vi publicidad de Volvo",
  "Me recomendaron la agencia",
  "Siempre me ha gustado la marca",
  "Pasé y sentí curiosidad",
  "Recibí información por WhatsApp",
  "Llamada entrante",
  "Sitio web",
  "Evento Volvo",
];
const TIPOS_PERSONA = ["Física", "Moral"];
const TIEMPOS_COMPRA = [
  "Este mes",
  "De 1 a 3 meses",
  "De 3 a 6 meses",
  "Solo estoy cotizando",
];
const FORMAS_CAPITALIZACION = [
  "Deseo un Crédito",
  "Quiero pagarlo de contado",
  "Me interesa un arrendamiento",
  "Me interesa evaluar opciones financieras",
];
const MENSUALIDADES = [3, 6, 12, 18, 24, 36, 48, 60, 72];
const FORMAS_COMPROBAR_INGRESOS = [
  "No cuenta",
  "Recibo de Nómina",
  "Factura por Servicios",
  "Estado de Cuenta",
  "Declaración de Impuestos",
  "Pago de Pensión",
  "Carta de Ingresos",
];
const MOTIVOS_COMPRA = [
  "Renovar auto",
  "Mi familia se hace más grande",
  "Mi trabajo me lo pide",
  "Mi estilo de vida me lo pide",
  "Busco seguridad",
  "Busco tecnología",
  "Busco una SUV premium",
];
const PERFILES_PROFESIONALES = [
  "Comercial",
  "Asalariado Sector Público",
  "Asalariado Sector Privado",
  "Pensionado",
  "Profesionista Independiente",
  "Empresario",
];
const ESTADOS_CIVILES = ["Soltero", "Casado", "Divorciado", "Unión libre"];
const PASATIEMPOS = [
  "Ciclismo", "Natación", "Futbol", "Pesca", "Senderismo", "Tenis-frontón",
  "Golf", "Mixología", "Cocinar", "Coleccionar objetos", "Viajar dentro del país",
  "Viajar fuera del país", "Automovilismo", "Fotografía", "Pintura", "Arquitectura",
  "Conciertos", "Ajedrez", "Lectura", "Desarrollo personal", "Pilates", "Yoga",
  "Neurociencias", "Aprendizaje de idioma",
];

const FORM_INICIAL = {
  agencia: "Volvo",
  nombre_prospecto: "",
  codigo_postal: "",
  telefono: "",
  email: "",
  asesor_ventas: "",
  motivo_ingreso: "",
  tipo_persona: "Física",
  tiempo_compra: "",
  auto_suenos: "",
  deja_auto_cuenta: false,
  modelo_auto_cuenta: "",
  forma_capitalizacion: "",
  presupuesto_estimado: "",
  enganche_presupuestado: "",
  mensualidades_presupuestadas: "",
  comprueba_ingresos: false,
  forma_comprobar_ingresos: "No cuenta",
  motivo_compra: "",
  perfil_profesional: "",
  edad: "",
  cantidad_hijos: "0",
  estado_civil: "",
  pasatiempos: [],
  comentarios: "",
};

// ─── UTILITY FUNCTIONS ───
function cls(...clases) { return clases.filter(Boolean).join(" "); }
function texto(valor) { return String(valor ?? "").trim(); }
function soloNumeros(valor) { return String(valor ?? "").replace(/\D/g, ""); }
function normalizarBusqueda(valor) {
  return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function normalizarTelefonoMx(valor) {
  const telefono = soloNumeros(valor);
  if (telefono.length === 10) return `52${telefono}`;
  if (telefono.length === 12 && telefono.startsWith("52")) return telefono;
  return telefono;
}
function validarTelefono(valor) {
  const telefono = soloNumeros(valor);
  if (telefono.length === 10) return true;
  if (telefono.length === 12 && telefono.startsWith("52")) return true;
  return false;
}
function mensajeTelefono(valor) {
  const telefono = soloNumeros(valor);
  if (!telefono) return "Captura un teléfono numérico.";
  if (telefono.length < 10) return "El teléfono debe tener mínimo 10 dígitos.";
  if (telefono.length === 11) return "Usa 10 dígitos o 52 + 10 dígitos.";
  if (telefono.length === 12 && !telefono.startsWith("52")) {
    return "Si tiene 12 dígitos debe iniciar con 52.";
  }
  if (telefono.length > 12) return "Máximo 12 dígitos.";
  return "Teléfono inválido.";
}
function validarEmail(valor) {
  const email = texto(valor);
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function normalizarPayload(form) {
  return {
    ...form,
    agencia: texto(form.agencia),
    nombre_prospecto: texto(form.nombre_prospecto).toUpperCase(),
    codigo_postal: soloNumeros(form.codigo_postal),
    telefono: normalizarTelefonoMx(form.telefono),
    email: texto(form.email),
    asesor_ventas: texto(form.asesor_ventas),
    auto_suenos: texto(form.auto_suenos),
    presupuesto_estimado: Number(soloNumeros(form.presupuesto_estimado) || 0),
    enganche_presupuestado: Number(soloNumeros(form.enganche_presupuestado) || 0),
    mensualidades_presupuestadas: Number(form.mensualidades_presupuestadas || 0),
    edad: form.edad === "" ? null : Number(soloNumeros(form.edad) || 0),
    cantidad_hijos: Number(soloNumeros(form.cantidad_hijos) || 0),
    modelo_auto_cuenta: form.deja_auto_cuenta ? texto(form.modelo_auto_cuenta) : "",
    pasatiempos: Array.isArray(form.pasatiempos) ? form.pasatiempos : [],
    comentarios: texto(form.comentarios),
  };
}
function obtenerErrores(form) {
  const errores = {};
  if (!texto(form.agencia)) errores.agencia = "Selecciona el dealer.";
  if (!texto(form.nombre_prospecto)) errores.nombre_prospecto = "Captura el nombre.";
  if (!soloNumeros(form.codigo_postal)) errores.codigo_postal = "Captura código postal.";
  if (!validarTelefono(form.telefono)) errores.telefono = mensajeTelefono(form.telefono);
  if (!validarEmail(form.email)) errores.email = "Correo inválido.";
  if (!texto(form.asesor_ventas)) errores.asesor_ventas = "Selecciona asesor.";
  if (!form.motivo_ingreso) errores.motivo_ingreso = "Selecciona ingreso.";
  if (!form.tiempo_compra) errores.tiempo_compra = "Selecciona cuándo compra.";
  if (!form.auto_suenos) errores.auto_suenos = "Selecciona el Volvo de sus sueños.";
  if (form.deja_auto_cuenta && !texto(form.modelo_auto_cuenta)) {
    errores.modelo_auto_cuenta = "Captura modelo.";
  }
  if (!form.forma_capitalizacion) errores.forma_capitalizacion = "Selecciona capitalización.";
  if (Number(soloNumeros(form.presupuesto_estimado) || 0) < 100000) {
    errores.presupuesto_estimado = "Mínimo 6 dígitos.";
  }
  if (Number(soloNumeros(form.enganche_presupuestado) || 0) < 10000) {
    errores.enganche_presupuestado = "Mínimo 5 dígitos.";
  }
  if (!form.mensualidades_presupuestadas) {
    errores.mensualidades_presupuestadas = "Selecciona mensualidades.";
  }
  if (!form.forma_comprobar_ingresos) {
    errores.forma_comprobar_ingresos = "Selecciona comprobación.";
  }
  if (!form.motivo_compra) errores.motivo_compra = "Selecciona motivo.";
  if (!form.perfil_profesional) errores.perfil_profesional = "Selecciona perfil.";
  if (!form.estado_civil) errores.estado_civil = "Selecciona estado civil.";
  if (!Array.isArray(form.pasatiempos) || form.pasatiempos.length < 3) {
    errores.pasatiempos = "Selecciona 3 pasatiempos.";
  }
  return errores;
}

// ─── COMPONENTES ───

function Campo({ label, requerido, error, ayuda, children, className = "" }) {
  return (
    <div className={cls("min-w-0", className)}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
        {requerido && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {ayuda && !error && <p className="mt-1 text-xs text-gray-400">{ayuda}</p>}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cls(
        "h-12 w-full rounded-2xl border-2 bg-white px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300 focus:border-red-400" : "border-gray-200 hover:border-gray-300",
        className
      )}
    />
  );
}

function Select({ error, children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-12 w-full rounded-2xl border-2 bg-white px-4 pr-10 text-sm text-gray-800 outline-none transition-all appearance-none cursor-pointer focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem center",
      }}
    >
      {children}
    </select>
  );
}

function Textarea({ error, className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cls(
        "min-h-[92px] w-full resize-none rounded-2xl border-2 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className
      )}
    />
  );
}

function ToggleSiNo({ value, onChange }) {
  return (
    <div className="flex h-12 w-full rounded-2xl border-2 border-gray-200 bg-white p-1 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cls(
          "flex-1 rounded-xl text-xs font-bold transition-all",
          value ? "bg-[#1a2a3a] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
        )}
      >
        Sí
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cls(
          "flex-1 rounded-xl text-xs font-bold transition-all",
          !value ? "bg-[#1a2a3a] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
        )}
      >
        No
      </button>
    </div>
  );
}

function AsesorAutocomplete({ value, onChange, error }) {
  const [abierto, setAbierto] = useState(false);
  const opciones = useMemo(() => {
    const q = normalizarBusqueda(value);
    if (!q) return ASESORES.slice(0, 8);
    return ASESORES.filter((a) => normalizarBusqueda(a).includes(q)).slice(0, 8);
  }, [value]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          error={error}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 140)}
          onChange={(e) => { onChange(e.target.value); setAbierto(true); }}
          placeholder="Buscar asesor..."
          className="pl-10"
        />
      </div>
      {abierto && (
        <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-52 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl">
          {opciones.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>
          ) : (
            opciones.map((asesor) => (
              <button
                key={asesor}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(asesor); setAbierto(false); }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                {asesor}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PasatiemposPicker({ value, onChange, error }) {
  const actuales = Array.isArray(value) ? value : [];
  const seleccionados = new Set(actuales);

  function toggle(item) {
    if (seleccionados.has(item)) {
      onChange(actuales.filter((x) => x !== item));
      return;
    }
    if (actuales.length >= 3) return;
    onChange([...actuales, item]);
  }

  return (
    <div className={cls(
      "rounded-2xl border-2 bg-white p-4 transition-all",
      error ? "border-red-300" : "border-gray-200"
    )}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Selecciona 3
        </span>
        <span className={cls(
          "rounded-full px-3 py-0.5 text-xs font-bold",
          actuales.length >= 3 ? "bg-[#1a2a3a] text-white" : "bg-gray-100 text-gray-500"
        )}>
          {actuales.length}/3
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto">
        {PASATIEMPOS.map((item) => {
          const activo = seleccionados.has(item);
          const bloqueado = !activo && actuales.length >= 3;
          return (
            <button
              key={item}
              type="button"
              disabled={bloqueado}
              onClick={() => toggle(item)}
              className={cls(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                activo
                  ? "bg-[#1a2a3a] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                bloqueado && "opacity-40 cursor-not-allowed"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ───

export default function TraficoPiso() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);

  const errores = useMemo(() => obtenerErrores(form), [form]);
  const hayErrores = Object.keys(errores).length > 0;

  function updateField(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  async function enviarFormulario(e) {
    e.preventDefault();
    setMostrarErrores(true);
    setMensaje("");
    setGuardado(false);

    const erroresActuales = obtenerErrores(form);
    if (Object.keys(erroresActuales).length > 0) {
      setMensaje(Object.values(erroresActuales)[0]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setEnviando(true);
      await apiTraficoPiso.create(normalizarPayload(form));
      setGuardado(true);
      setMensaje("✅ Registro guardado correctamente.");
      setForm(FORM_INICIAL);
      setMostrarErrores(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setMensaje(error.message || "No fue posible guardar el registro.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setEnviando(false);
    }
  }

  function error(campo) {
    return mostrarErrores ? errores[campo] : "";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60"
        >
          {/* HEADER — Estilo Volvo */}
          <div className="relative overflow-hidden bg-[#1a2a3a] px-8 py-6 md:px-12 md:py-8">
            {/* Fondo decorativo */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-amber-400/5 blur-2xl" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
               <h1
                  className="text-5xl font-extralight tracking-[0.6em] text-white uppercase"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  VOLVO
                </h1>
                <p
                  className="text-xs font-light uppercase tracking-[0.25em] text-white"
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
                  }}
                >
                  TRAFICO DE PISO
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-2.5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white/80">
                  Automotriz R&amp;R
                </span>
              </div>
            </div>
          </div>

          {/* SUBHEADER */}
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-4 md:px-12">
            <p className="text-sm text-gray-600">
              Completa los datos del prospecto que ingresa a la agencia.
            </p>
          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div className={cls(
              "mx-8 mt-6 rounded-2xl border px-5 py-3.5 text-sm font-medium md:mx-12",
              guardado
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            )}>
              {mensaje}
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={enviarFormulario} className="p-6 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Dealer */}
              <Campo label="Dealer" requerido error={error("agencia")}>
                <Select
                  value={form.agencia}
                  error={error("agencia")}
                  onChange={(e) => updateField("agencia", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {AGENCIAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </Campo>

              {/* Nombre */}
              <Campo label="Nombre" requerido error={error("nombre_prospecto")}>
                <Input
                  value={form.nombre_prospecto}
                  error={error("nombre_prospecto")}
                  onChange={(e) => updateField("nombre_prospecto", e.target.value.toUpperCase())}
                  placeholder="NOMBRE COMPLETO"
                />
              </Campo>

              {/* CP */}
              <Campo label="Código postal" requerido error={error("codigo_postal")}>
                <Input
                  value={form.codigo_postal}
                  error={error("codigo_postal")}
                  onChange={(e) => updateField("codigo_postal", soloNumeros(e.target.value).slice(0, 5))}
                  inputMode="numeric"
                  placeholder="68300"
                />
              </Campo>

              {/* Teléfono */}
              <Campo
                label="Teléfono"
                requerido
                error={error("telefono")}
                ayuda="10 dígitos o 52 + 10 dígitos"
              >
                <Input
                  value={form.telefono}
                  error={error("telefono")}
                  onChange={(e) => updateField("telefono", soloNumeros(e.target.value).slice(0, 12))}
                  inputMode="numeric"
                  placeholder="2711234567"
                />
              </Campo>

              {/* Email */}
              <Campo label="E-mail" error={error("email")}>
                <Input
                  type="email"
                  value={form.email}
                  error={error("email")}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="correo@dominio.com"
                />
              </Campo>

              {/* Asesor */}
              <Campo label="Asesor" requerido error={error("asesor_ventas")}>
                <AsesorAutocomplete
                  value={form.asesor_ventas}
                  error={error("asesor_ventas")}
                  onChange={(valor) => updateField("asesor_ventas", valor)}
                />
              </Campo>

              {/* Motivo ingreso */}
              <Campo label="Ingresó porque" requerido error={error("motivo_ingreso")}>
                <Select
                  value={form.motivo_ingreso}
                  error={error("motivo_ingreso")}
                  onChange={(e) => updateField("motivo_ingreso", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {MOTIVOS_INGRESO.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>

              {/* Persona */}
              <Campo label="Persona" requerido>
                <div className="flex h-12 w-full rounded-2xl border-2 border-gray-200 bg-white p-1 overflow-hidden">
                  {TIPOS_PERSONA.map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => updateField("tipo_persona", tipo)}
                      className={cls(
                        "flex-1 rounded-xl text-xs font-bold transition-all",
                        form.tipo_persona === tipo
                          ? "bg-[#1a2a3a] text-white shadow-sm"
                          : "text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </Campo>

              {/* Compra (tiempo) */}
              <Campo label="Compra" requerido error={error("tiempo_compra")}>
                <Select
                  value={form.tiempo_compra}
                  error={error("tiempo_compra")}
                  onChange={(e) => updateField("tiempo_compra", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {TIEMPOS_COMPRA.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>

              {/* Auto cuenta */}
              <Campo label="Auto cuenta" requerido>
                <ToggleSiNo
                  value={form.deja_auto_cuenta}
                  onChange={(valor) => updateField("deja_auto_cuenta", valor)}
                />
              </Campo>

              {/* Modelo cuenta */}
              <Campo
                label="Modelo cuenta"
                requerido={form.deja_auto_cuenta}
                error={error("modelo_auto_cuenta")}
              >
                <Input
                  value={form.modelo_auto_cuenta}
                  error={error("modelo_auto_cuenta")}
                  disabled={!form.deja_auto_cuenta}
                  onChange={(e) => updateField("modelo_auto_cuenta", e.target.value)}
                  placeholder="Ej. XC60 2020"
                  className={cls(!form.deja_auto_cuenta && "opacity-50 cursor-not-allowed")}
                />
              </Campo>

              {/* Volvo sueños */}
              <Campo label="Volvo de sus sueños" requerido error={error("auto_suenos")}>
                <Select
                  value={form.auto_suenos}
                  error={error("auto_suenos")}
                  onChange={(e) => updateField("auto_suenos", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {VEHICULOS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </Select>
              </Campo>

              {/* Capitalización */}
              <Campo label="Capitalización" requerido error={error("forma_capitalizacion")}>
                <Select
                  value={form.forma_capitalizacion}
                  error={error("forma_capitalizacion")}
                  onChange={(e) => updateField("forma_capitalizacion", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {FORMAS_CAPITALIZACION.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>

              {/* Presupuesto */}
              <Campo label="Presupuesto" requerido error={error("presupuesto_estimado")} ayuda="Mín. 6 dígitos">
                <Input
                  value={form.presupuesto_estimado}
                  error={error("presupuesto_estimado")}
                  onChange={(e) => updateField("presupuesto_estimado", soloNumeros(e.target.value))}
                  inputMode="numeric"
                  placeholder="800000"
                />
              </Campo>

              {/* Enganche */}
              <Campo label="Enganche" requerido error={error("enganche_presupuestado")} ayuda="Mín. 5 dígitos">
                <Input
                  value={form.enganche_presupuestado}
                  error={error("enganche_presupuestado")}
                  onChange={(e) => updateField("enganche_presupuestado", soloNumeros(e.target.value))}
                  inputMode="numeric"
                  placeholder="100000"
                />
              </Campo>

              {/* Mensualidades */}
              <Campo label="Mensualidades" requerido error={error("mensualidades_presupuestadas")}>
                <Select
                  value={form.mensualidades_presupuestadas}
                  error={error("mensualidades_presupuestadas")}
                  onChange={(e) => updateField("mensualidades_presupuestadas", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {MENSUALIDADES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>

              {/* Ingresos */}
              <Campo label="Ingresos" requerido>
                <ToggleSiNo
                  value={form.comprueba_ingresos}
                  onChange={(valor) => updateField("comprueba_ingresos", valor)}
                />
              </Campo>

              {/* Comprueba con */}
              <Campo label="Comprueba con" requerido error={error("forma_comprobar_ingresos")}>
                <Select
                  value={form.forma_comprobar_ingresos}
                  error={error("forma_comprobar_ingresos")}
                  onChange={(e) => updateField("forma_comprobar_ingresos", e.target.value)}
                >
                  {FORMAS_COMPROBAR_INGRESOS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>

              {/* Motivo compra */}
              <Campo label="Motivo compra" requerido error={error("motivo_compra")}>
                <Select
                  value={form.motivo_compra}
                  error={error("motivo_compra")}
                  onChange={(e) => updateField("motivo_compra", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {MOTIVOS_COMPRA.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>

              {/* Perfil */}
              <Campo label="Perfil" requerido error={error("perfil_profesional")}>
                <Select
                  value={form.perfil_profesional}
                  error={error("perfil_profesional")}
                  onChange={(e) => updateField("perfil_profesional", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {PERFILES_PROFESIONALES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>
            </div>

            {/* Fila de Estado civil, Edad, Hijos */}
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <Campo label="Estado civil" requerido error={error("estado_civil")}>
                <Select
                  value={form.estado_civil}
                  error={error("estado_civil")}
                  onChange={(e) => updateField("estado_civil", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {ESTADOS_CIVILES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Campo>

              <Campo label="Edad">
                <Input
                  value={form.edad}
                  onChange={(e) => updateField("edad", soloNumeros(e.target.value).slice(0, 3))}
                  inputMode="numeric"
                  placeholder="35"
                />
              </Campo>

              <Campo label="Hijos">
                <Input
                  value={form.cantidad_hijos}
                  onChange={(e) => updateField("cantidad_hijos", soloNumeros(e.target.value).slice(0, 2))}
                  inputMode="numeric"
                  placeholder="0"
                />
              </Campo>
            </div>

            {/* Pasatiempos + Comentarios */}
            <div className="mt-5 grid gap-5 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <Campo label="Pasatiempos" requerido error={error("pasatiempos")}>
                  <PasatiemposPicker
                    value={form.pasatiempos}
                    error={error("pasatiempos")}
                    onChange={(valor) => updateField("pasatiempos", valor)}
                  />
                </Campo>
              </div>
              <div className="lg:col-span-3">
                <Campo label="Comentarios">
                  <Textarea
                    value={form.comentarios}
                    onChange={(e) => updateField("comentarios", e.target.value)}
                    placeholder="Notas adicionales del prospecto..."
                    rows={3}
                  />
                </Campo>
              </div>
            </div>

            {/* FOOTER — Botón guardar */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50/80 px-6 py-4 md:flex-row">
              <p className="text-sm text-gray-500">
                {mostrarErrores && hayErrores
                  ? `⚠️ ${Object.values(errores)[0]}`
                  : "📋 Revisa los datos y guarda el registro."}
              </p>
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a2a3a] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2a3a4a] hover:shadow-lg hover:shadow-[#1a2a3a]/20 disabled:opacity-60 md:w-auto"
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar registro
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}