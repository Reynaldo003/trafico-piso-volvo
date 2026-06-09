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
} from "lucide-react";

import { apiTraficoPiso } from "./lib/traficoPisoApi";
import fondo3 from "./assets/fondo3.jpeg";

const AGENCIAS = ["Volvo"];

const ASESORES = [
  "Enrique Vazquez Islas",
  "Ricardo Platas",
  "Verónica Del Rayo Galindo León",
  "Julio Camacho Barragán",
  "Fernanda Romero Aguilar",
];

const VEHICULOS = [
  "EX30",
  "EX40",
  "EC40",
  "EX90",
  "XC60",
  "XC90",
  "XC60 Black Edition",
  "XC90 Black Edition",
  "Seminuevos",
  "Avalúo",
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
  "Ciclismo",
  "Natación",
  "Futbol",
  "Pesca",
  "Senderismo",
  "Tenis-frontón",
  "Golf",
  "Mixología",
  "Cocinar",
  "Coleccionar objetos",
  "Viajar dentro del país",
  "Viajar fuera del país",
  "Automovilismo",
  "Fotografía",
  "Pintura",
  "Arquitectura",
  "Conciertos",
  "Ajedrez",
  "Lectura",
  "Desarrollo personal",
  "Pilates",
  "Yoga",
  "Neurociencias",
  "Aprendizaje de idioma",
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

function cls(...clases) {
  return clases.filter(Boolean).join(" ");
}

function texto(valor) {
  return String(valor ?? "").trim();
}

function soloNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function normalizarBusqueda(valor) {
  return texto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizarTelefonoMx(valor) {
  const telefono = soloNumeros(valor);

  if (telefono.length === 10) {
    return `52${telefono}`;
  }

  if (telefono.length === 12 && telefono.startsWith("52")) {
    return telefono;
  }

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

function Campo({ label, icono: Icono, requerido, error, ayuda, children, className = "" }) {
  return (
    <div className={cls("min-w-0", className)}>
      <label className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white/65">
        {Icono ? <Icono className="h-3 w-3 shrink-0 text-white/45" /> : null}
        <span className="truncate">
          {label}
          {requerido ? <b className="ml-0.5 text-red-200">*</b> : null}
        </span>
      </label>

      {children}

      {error ? (
        <p className="mt-1 line-clamp-2 text-[10px] font-bold leading-tight text-red-200">
          {error}
        </p>
      ) : ayuda ? (
        <p className="mt-1 truncate text-[10px] leading-tight text-white/45">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cls(
        "h-8 w-full lg:w-40 rounded-lg border bg-white/10 px-2.5 text-xs font-bold text-white outline-none transition placeholder:text-white/35",
        error
          ? "border-red-200 ring-1 ring-red-300/20"
          : "border-white/10 focus:border-white/40 focus:ring-1 focus:ring-white/10",
        props.disabled ? "cursor-not-allowed opacity-50" : "",
        className,
      )}
    />
  );
}

function Select({ error, children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-8 w-full lg:w-40 rounded-lg border bg-[#0b1b54]/95 px-2.5 text-xs font-bold text-white outline-none transition",
        error
          ? "border-red-200 ring-1 ring-red-300/20"
          : "border-white/10 focus:border-white/40 focus:ring-1 focus:ring-white/10",
        className,
      )}
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
        "min-h-[52px] w-full resize-none rounded-lg border bg-white/10 px-2.5 py-2 text-xs font-bold text-white outline-none transition placeholder:text-white/35",
        error
          ? "border-red-200 ring-1 ring-red-300/20"
          : "border-white/10 focus:border-white/40 focus:ring-1 focus:ring-white/10",
        className,
      )}
    />
  );
}

function ToggleSiNo({ value, onChange }) {
  return (
    <div className="grid h-8 w-full lg:w-40 grid-cols-2 rounded-lg border border-white/10 bg-white/10 p-0.5">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cls(
          "rounded-md px-2 text-[11px] font-black transition",
          value ? "bg-white text-[#131E5C]" : "text-white/80 hover:bg-white/10",
        )}
      >
        SÍ
      </button>

      <button
        type="button"
        onClick={() => onChange(false)}
        className={cls(
          "rounded-md px-2 text-[11px] font-black transition",
          !value ? "bg-white text-[#131E5C]" : "text-white/80 hover:bg-white/10",
        )}
      >
        NO
      </button>
    </div>
  );
}

function AsesorAutocomplete({ value, onChange, error }) {
  const [abierto, setAbierto] = useState(false);

  const opciones = useMemo(() => {
    const q = normalizarBusqueda(value);

    if (!q) return ASESORES.slice(0, 8);

    return ASESORES.filter((asesor) =>
      normalizarBusqueda(asesor).includes(q),
    ).slice(0, 8);
  }, [value]);

  return (
    <div className="relative w-full lg:w-40">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/45" />

        <Input
          value={value}
          error={error}
          onFocus={() => setAbierto(true)}
          onBlur={() => {
            window.setTimeout(() => setAbierto(false), 140);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setAbierto(true);
          }}
          placeholder="Buscar asesor..."
          className="pl-7"
        />
      </div>

      {abierto ? (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#07122f] p-1 shadow-2xl">
          {opciones.length === 0 ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setAbierto(false)}
              className="block w-full rounded-md px-2 py-1.5 text-left text-[11px] font-semibold text-white/70 hover:bg-white/10"
            >
              Sin coincidencias. Puedes dejarlo escrito.
            </button>
          ) : null}

          {opciones.map((asesor) => (
            <button
              key={asesor}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(asesor);
                setAbierto(false);
              }}
              className="block w-full rounded-md px-2 py-1.5 text-left text-[11px] font-bold text-white hover:bg-white/10"
            >
              {asesor}
            </button>
          ))}
        </div>
      ) : null}
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
    <div
      className={cls(
        "min-h-[92px] rounded-lg border bg-white/5 p-2",
        error ? "border-red-200 ring-1 ring-red-300/20" : "border-white/10",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">
          Selecciona 3 opciones
        </p>

        <span
          className={cls(
            "rounded-full border px-2 py-0.5 text-[10px] font-black",
            actuales.length >= 3
              ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
              : "border-amber-300/40 bg-amber-400/15 text-amber-100",
          )}
        >
          {actuales.length}/3
        </span>
      </div>

      <div className="flex max-h-[58px] flex-wrap gap-1.5 overflow-y-auto pr-1">
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
                "rounded-full border px-2.5 py-1 text-[10px] font-black transition",
                activo
                  ? "border-white bg-white text-[#131E5C]"
                  : "border-white/15 bg-white/10 text-white hover:bg-white/20",
                bloqueado ? "cursor-not-allowed opacity-45" : "",
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
      setMensaje("Registro guardado correctamente.");
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
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(44,91,187,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.10),_transparent_28%)]" />
        <div className="absolute left-[-12%] top-[-8%] h-72 w-72 rounded-full bg-[#2A63FF]/10 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-10%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,16,45,0.96),rgba(11,31,94,0.92),rgba(7,16,38,0.98))]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-2 py-3 sm:px-4 sm:py-4 lg:max-w-[950px] lg:px-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full overflow-hidden rounded-2xl border border-[#131E5C]/10 p-2.5 shadow-[0_30px_80px_-25px_rgba(19,30,92,0.14)] sm:p-4"
          style={{
            backgroundImage: `url(${fondo3})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-[#071126]/30" />

          <div className="relative z-10">
            <header className="mb-3 flex flex-col items-center justify-center gap-2 text-center">
              <div className="flex flex-col items-center text-center">
                <div className="mb-1 flex justify-center">
                  <span className="inline-flex items-center rounded-full border border-white/50 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                    Automotriz R&amp;R · Volvo
                  </span>
                </div>

                <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Registro de tráfico de piso
                </h1>
              </div>
            </header>

            {mensaje ? (
              <div
                className={cls(
                  "mb-2.5 rounded-lg border px-3 py-2 text-xs font-bold",
                  guardado
                    ? "border-emerald-200/30 bg-emerald-400/15 text-emerald-100"
                    : "border-red-200/30 bg-red-400/15 text-red-100",
                )}
              >
                {mensaje}
              </div>
            ) : null}

            <form onSubmit={enviarFormulario}>
              <div className="rounded-2xl border border-white/10 p-2.5 backdrop-blur-xs sm:p-3">
                <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  <Campo label="Dealer" icono={Building2} requerido error={error("agencia")}>
                    <Select
                      value={form.agencia}
                      error={error("agencia")}
                      onChange={(e) => updateField("agencia", e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {AGENCIAS.map((agencia) => (
                        <option key={agencia} value={agencia}>
                          {agencia}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo
                    label="Nombre"
                    icono={UserRound}
                    requerido
                    error={error("nombre_prospecto")}
                  >
                    <Input
                      value={form.nombre_prospecto}
                      error={error("nombre_prospecto")}
                      onChange={(e) =>
                        updateField("nombre_prospecto", e.target.value.toUpperCase())
                      }
                      placeholder="NOMBRE COMPLETO"
                    />
                  </Campo>

                  <Campo
                    label="Código postal"
                    icono={ClipboardList}
                    requerido
                    error={error("codigo_postal")}
                  >
                    <Input
                      value={form.codigo_postal}
                      error={error("codigo_postal")}
                      onChange={(e) =>
                        updateField("codigo_postal", soloNumeros(e.target.value).slice(0, 5))
                      }
                      inputMode="numeric"
                      placeholder="68300"
                    />
                  </Campo>

                  <Campo
                    label="Teléfono"
                    icono={Phone}
                    requerido
                    error={error("telefono")}
                    ayuda="10 dígitos o 52 + 10 dígitos."
                  >
                    <Input
                      value={form.telefono}
                      error={error("telefono")}
                      onChange={(e) =>
                        updateField("telefono", soloNumeros(e.target.value).slice(0, 12))
                      }
                      inputMode="numeric"
                      placeholder="2711234567"
                    />
                  </Campo>

                  <Campo label="E-mail" icono={Mail} error={error("email")}>
                    <Input
                      type="email"
                      value={form.email}
                      error={error("email")}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="correo@dominio.com"
                    />
                  </Campo>

                  <Campo
                    label="Asesor"
                    icono={Search}
                    requerido
                    error={error("asesor_ventas")}
                  >
                    <AsesorAutocomplete
                      value={form.asesor_ventas}
                      error={error("asesor_ventas")}
                      onChange={(valor) => updateField("asesor_ventas", valor)}
                    />
                  </Campo>

                  <Campo
                    label="Ingresó porque"
                    icono={MessageSquareText}
                    requerido
                    error={error("motivo_ingreso")}
                  >
                    <Select
                      value={form.motivo_ingreso}
                      error={error("motivo_ingreso")}
                      onChange={(e) => updateField("motivo_ingreso", e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {MOTIVOS_INGRESO.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo label="Persona" icono={Users} requerido>
                    <div className="grid h-8 grid-cols-2 rounded-lg border border-white/10 bg-white/10 p-0.5">
                      {TIPOS_PERSONA.map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => updateField("tipo_persona", tipo)}
                          className={cls(
                            "rounded-md px-2 text-[11px] font-black transition",
                            form.tipo_persona === tipo
                              ? "bg-white text-[#131E5C]"
                              : "text-white/80 hover:bg-white/10",
                          )}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </Campo>

                  <Campo
                    label="Compra"
                    icono={CalendarDays}
                    requerido
                    error={error("tiempo_compra")}
                  >
                    <Select
                      value={form.tiempo_compra}
                      error={error("tiempo_compra")}
                      onChange={(e) => updateField("tiempo_compra", e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {TIEMPOS_COMPRA.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo label="Auto cuenta" icono={CarFront} requerido>
                    <ToggleSiNo
                      value={form.deja_auto_cuenta}
                      onChange={(valor) => updateField("deja_auto_cuenta", valor)}
                    />
                  </Campo>

                  <Campo
                    label="Modelo cuenta"
                    icono={CarFront}
                    requerido={form.deja_auto_cuenta}
                    error={error("modelo_auto_cuenta")}
                  >
                    <Input
                      value={form.modelo_auto_cuenta}
                      error={error("modelo_auto_cuenta")}
                      disabled={!form.deja_auto_cuenta}
                      onChange={(e) => updateField("modelo_auto_cuenta", e.target.value)}
                      placeholder="Ej. XC60 2020"
                    />
                  </Campo>

                  <Campo
                    label="Volvo de sus sueños"
                    icono={CarFront}
                    requerido
                    error={error("auto_suenos")}
                  >
                    <Select
                      value={form.auto_suenos}
                      error={error("auto_suenos")}
                      onChange={(e) => updateField("auto_suenos", e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {VEHICULOS.map((vehiculo) => (
                        <option key={vehiculo} value={vehiculo}>
                          {vehiculo}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo
                    label="Capitalización"
                    icono={CircleDollarSign}
                    requerido
                    error={error("forma_capitalizacion")}
                  >
                    <Select
                      value={form.forma_capitalizacion}
                      error={error("forma_capitalizacion")}
                      onChange={(e) => updateField("forma_capitalizacion", e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {FORMAS_CAPITALIZACION.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo
                    label="Presupuesto"
                    icono={BadgeDollarSign}
                    requerido
                    error={error("presupuesto_estimado")}
                    ayuda="Mín. 6 dígitos."
                  >
                    <Input
                      value={form.presupuesto_estimado}
                      error={error("presupuesto_estimado")}
                      onChange={(e) =>
                        updateField("presupuesto_estimado", soloNumeros(e.target.value))
                      }
                      inputMode="numeric"
                      placeholder="800000"
                    />
                  </Campo>

                  <Campo
                    label="Enganche"
                    icono={BadgeDollarSign}
                    requerido
                    error={error("enganche_presupuestado")}
                    ayuda="Mín. 5 dígitos."
                  >
                    <Input
                      value={form.enganche_presupuestado}
                      error={error("enganche_presupuestado")}
                      onChange={(e) =>
                        updateField("enganche_presupuestado", soloNumeros(e.target.value))
                      }
                      inputMode="numeric"
                      placeholder="100000"
                    />
                  </Campo>

                  <Campo
                    label="Mensualidades"
                    icono={CalendarDays}
                    requerido
                    error={error("mensualidades_presupuestadas")}
                  >
                    <Select
                      value={form.mensualidades_presupuestadas}
                      error={error("mensualidades_presupuestadas")}
                      onChange={(e) =>
                        updateField("mensualidades_presupuestadas", e.target.value)
                      }
                    >
                      <option value="">Seleccionar...</option>
                      {MENSUALIDADES.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo label="Ingresos" icono={ShieldCheck} requerido>
                    <ToggleSiNo
                      value={form.comprueba_ingresos}
                      onChange={(valor) => updateField("comprueba_ingresos", valor)}
                    />
                  </Campo>

                  <Campo
                    label="Comprueba con"
                    icono={ClipboardList}
                    requerido
                    error={error("forma_comprobar_ingresos")}
                  >
                    <Select
                      value={form.forma_comprobar_ingresos}
                      error={error("forma_comprobar_ingresos")}
                      onChange={(e) =>
                        updateField("forma_comprobar_ingresos", e.target.value)
                      }
                    >
                      {FORMAS_COMPROBAR_INGRESOS.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo
                    label="Motivo compra"
                    icono={MessageSquareText}
                    requerido
                    error={error("motivo_compra")}
                  >
                    <Select
                      value={form.motivo_compra}
                      error={error("motivo_compra")}
                      onChange={(e) => updateField("motivo_compra", e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {MOTIVOS_COMPRA.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo
                    label="Perfil"
                    icono={BriefcaseBusiness}
                    requerido
                    error={error("perfil_profesional")}
                  >
                    <Select
                      value={form.perfil_profesional}
                      error={error("perfil_profesional")}
                      onChange={(e) => updateField("perfil_profesional", e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {PERFILES_PROFESIONALES.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                      <Campo
                        label="Estado civil"
                        icono={Users}
                        requerido
                        error={error("estado_civil")}
                      >
                        <Select
                          value={form.estado_civil}
                          error={error("estado_civil")}
                          onChange={(e) => updateField("estado_civil", e.target.value)}
                          className="lg:!w-full"
                        >
                          <option value="">Seleccionar...</option>
                          {ESTADOS_CIVILES.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </Select>
                      </Campo>

                      <Campo label="Edad" icono={UserRound}>
                        <Input
                          value={form.edad}
                          onChange={(e) =>
                            updateField("edad", soloNumeros(e.target.value).slice(0, 3))
                          }
                          inputMode="numeric"
                          placeholder="35"
                          className="lg:!w-full"
                        />
                      </Campo>

                      <Campo label="Hijos" icono={Users}>
                        <Input
                          value={form.cantidad_hijos}
                          onChange={(e) =>
                            updateField("cantidad_hijos", soloNumeros(e.target.value).slice(0, 2))
                          }
                          inputMode="numeric"
                          placeholder="0"
                          className="lg:!w-full"
                        />
                      </Campo>
                    </div>
                  </div>

                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
                    <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-5">
                      <Campo
                        label="Pasatiempos"
                        icono={HeartHandshake}
                        requerido
                        error={error("pasatiempos")}
                        className="lg:col-span-2"
                      >
                        <PasatiemposPicker
                          value={form.pasatiempos}
                          error={error("pasatiempos")}
                          onChange={(valor) => updateField("pasatiempos", valor)}
                        />
                      </Campo>

                      <Campo
                        label="Comentarios"
                        icono={MessageSquareText}
                        className="lg:col-span-3"
                      >
                        <Textarea
                          value={form.comentarios}
                          onChange={(e) => updateField("comentarios", e.target.value)}
                          placeholder="Notas adicionales del prospecto..."
                          rows={3}
                          className="min-h-[92px]"
                        />
                      </Campo>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 rounded-xl border border-white/10 bg-[#06122f]/80 p-2.5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-white/70">
                    {mostrarErrores && hayErrores
                      ? Object.values(errores)[0]
                      : "Revisa los datos y guarda el registro."}
                  </p>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-black text-[#131E5C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}