import React, { useEffect, useState } from 'react';
import { Mail, Send, Inbox, User, CheckCircle, Clock, Search, AlertCircle } from 'lucide-react';
import BackToDashboard from '../../components/BackToDashboard/BackToDashboard';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import apiClient from '../../api/client';
import { useAuth } from '../../context/useAuth';

// Interfaces
interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
}

interface Notificacion {
  id_notificacion: number;
  mensaje: string;
  fecha_creacion: string;
  leido: boolean;
  novedad?: any;
}

const NotificacionesAdmin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'enviar' | 'bandeja'>('enviar');

  // Estado para "Enviar Mensaje"
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUs0uarios, setLoadingUsuarios] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Estado para "Bandeja de Entrada"
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);

  // Cargar usuarios al montar
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Cargar notificaciones cuando cambia la tab a 'bandeja'
  useEffect(() => {
    if (activeTab === 'bandeja' && user?.id_usuario) {
      fetchNotificaciones();
    }
  }, [activeTab, user]);

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const response = await apiClient.get('/usuario/listar');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchNotificaciones = async () => {
    if (!user?.id_usuario) return;
    setLoadingNotificaciones(true);
    try {
      const response = await apiClient.get(`/notificacion/usuario/${user.id_usuario}`);
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoadingNotificaciones(false);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !mensaje.trim()) return;

    setSending(true);
    try {
      await apiClient.post('/notificacion', {
        id_usuario: selectedUser.id_usuario,
        mensaje: mensaje,
      });
      setSendSuccess(true);
      setMensaje('');
      setSelectedUser(null);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleMarcarLeida = async (id: number) => {
    try {
      await apiClient.patch(`/notificacion/${id}/leida`);
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => n.id_notificacion === id ? { ...n, leido: true } : n)
      );
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  // Filtrar usuarios para el buscador
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Navbar fija en la parte superior */}
      <div className="flex-none z-50 shadow-md">
        <Navbar />
      </div>

      <BackToDashboard />

      {/* Área de contenido con scroll independiente */}
      <main className="flex-grow overflow-y-auto px-4 py-8 pb-24">
        <div className="container mx-auto max-w-5xl mt-8">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <Mail className="w-8 h-8 text-blue-600" />
              Centro de Notificaciones
            </h1>
            <p className="text-gray-600 mt-2">Gestiona la comunicación con los usuarios del sistema</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('enviar')}
                className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 transition-colors
                  ${activeTab === 'enviar'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <Send className="w-5 h-5" />
                Enviar Mensaje
              </button>
              <button
                onClick={() => setActiveTab('bandeja')}
                className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 transition-colors
                  ${activeTab === 'bandeja'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <Inbox className="w-5 h-5" />
                Bandeja de Entrada
              </button>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[500px]">

              {/* TAB: ENVIAR MENSAJE */}
              {activeTab === 'enviar' && (
                <div className="max-w-2xl mx-auto">
                  <form onSubmit={handleEnviar} className="space-y-6">

                    {/* Selector de Usuario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destinatario
                      </label>

                      {!selectedUser ? (
                        <div className="relative">
                          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Buscar usuario por nombre o correo..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />

                          {/* Lista de resultados */}
                          {searchTerm && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map(u => (
                                  <button
                                    key={u.id_usuario}
                                    type="button"
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setSearchTerm('');
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                                  >
                                    <div className="bg-blue-100 p-2 rounded-full">
                                      <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800">{u.nombre}</p>
                                      <p className="text-xs text-gray-500">{u.correo} • {u.rol}</p>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">No se encontraron usuarios</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{selectedUser.nombre}</p>
                              <p className="text-sm text-gray-600">{selectedUser.correo}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Cambiar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje
                      </label>
                      <textarea
                        rows={6}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Escribe tu mensaje aquí..."
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                      />
                    </div>

                    {/* Botón Enviar */}
                    <button
                      type="submit"
                      disabled={!selectedUser || !mensaje.trim() || sending}
                      className={`w-full py-3 px-6 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all
                        ${!selectedUser || !mensaje.trim() || sending
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'}`}
                    >
                      {sending ? (
                        <>Enviando...</>
                      ) : (
                        <>
                          <Send className="w-5 h-5" /> Enviar Notificación
                        </>
                      )}
                    </button>

                    {/* Mensaje de éxito */}
                    {sendSuccess && (
                      <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 animate-fade-in">
                        <CheckCircle className="w-5 h-5" />
                        Mensaje enviado correctamente
                      </div>
                    )}

                  </form>
                </div>
              )}

              {/* TAB: BANDEJA DE ENTRADA */}
              {activeTab === 'bandeja' && (
                <div className="space-y-4">
                  {loadingNotificaciones ? (
                    <div className="text-center py-10 text-gray-500">Cargando notificaciones...</div>
                  ) : notificaciones.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                    </div>
                  ) : (
                    notificaciones.map((notif) => (
                      <div
                        key={notif.id_notificacion}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md
                          ${notif.leido
                            ? 'bg-white border-gray-200'
                            : 'bg-blue-50 border-blue-200 shadow-sm'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className={`mt-1 p-2 rounded-full ${notif.leido ? 'bg-gray-100' : 'bg-blue-100'}`}>
                              {notif.leido ? (
                                <CheckCircle className="w-5 h-5 text-gray-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className={`text-gray-800 ${!notif.leido && 'font-semibold'}`}>
                                {notif.mensaje}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {new Date(notif.fecha_creacion).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {!notif.leido && (
                            <button
                              onClick={() => handleMarcarLeida(notif.id_notificacion)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            >
                              Marcar como leída
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotificacionesAdmin;
