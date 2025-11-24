import { Edit, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import apiClient from '../../api/client';

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string;
  tienda?: string | null;
}

interface Rol {
  id_rol: number;
  nombre_rol: string;
}

interface Tienda {
  id_tienda: number;
  nombre_tienda: string;
}

const UsuariosRegis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Usuario[]>([]);

  // Estados para edición
  const [roles, setRoles] = useState<Rol[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const [resUsuarios, resDatos] = await Promise.all([
          apiClient.get('/usuario/listar'),
          apiClient.get('/usuario'), // Endpoint para roles y tiendas
        ]);
        setUsers(resUsuarios.data);
        setRoles(resDatos.data.roles);
        setTiendas(resDatos.data.tiendas);
      } catch (error) {
        console.error('Error al traer datos:', error);
      }
    };

    fetchUsuarios();
  }, []);

  const filteredUsers = users
    .filter(
      (user) =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rol?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const formatFechaConHoraFija = (fecha: string): string => {
    const [fechaParte] = fecha.split(' '); // "2025-07-06"
    const fechaConHoraFija = new Date(`${fechaParte}T05:00:00`);

    return fechaConHoraFija.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await apiClient.delete(`/usuario/${id}/eliminar`);
        setUsers(users.filter((u) => u.id_usuario !== id));
        alert('✅ Usuario eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('❌ Error al eliminar usuario');
      }
    }
  };

  const handleEditar = (user: Usuario) => {
    setEditingUser(user);
    const rolObj = roles.find((r) => r.nombre_rol === user.rol);
    setSelectedRole(rolObj ? rolObj.id_rol : null);

    if (user.tienda) {
      const tiendaObj = tiendas.find((t) => t.nombre_tienda === user.tienda);
      setSelectedStore(tiendaObj ? tiendaObj.id_tienda : null);
    } else {
      setSelectedStore(null);
    }
  };

  const handleGuardarEdicion = async () => {
    if (!editingUser || !selectedRole) return;

    try {
      await apiClient.put(
        `/usuario/${editingUser.id_usuario}/editar`,
        {
          nuevoRolId: selectedRole,
          idTienda: selectedStore,
        },
      );

      const nuevoRolNombre = roles.find((r) => r.id_rol === selectedRole)?.nombre_rol || '';
      const nuevaTiendaNombre = tiendas.find((t) => t.id_tienda === selectedStore)?.nombre_tienda || null;

      setUsers(
        users.map((u) =>
          u.id_usuario === editingUser.id_usuario
            ? { ...u, rol: nuevoRolNombre, tienda: nuevaTiendaNombre }
            : u,
        ),
      );

      alert('✅ Usuario actualizado correctamente');
      setEditingUser(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('❌ Error al actualizar usuario');
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white relative">
      <Navbar />

      <main className="flex-grow px-4 pt-16 pb-10 bg-gray-100">
        <div
          className="bg-white px-8 py-6 rounded-xl w-full max-w-6xl mx-auto 
          relative shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
          hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] 
          transform hover:scale-[1.01] transition-all duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">
              USUARIOS REGISTRADOS
            </h1>
            <span className="text-sm text-gray-600">Total: {users.length}</span>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o rol..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4669AF] focus:border-transparent bg-white text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabla de usuarios */}
          <div className="overflow-y-auto max-h-[300px] w-full rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Correo</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Registro</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.nombre}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-[#e8effc] transition-all`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center">
                      <div className="w-8 h-8 bg-[#4669AF]/20 text-[#4669AF] rounded-full flex items-center justify-center mr-3 font-bold">
                        {user.nombre.charAt(0)}
                      </div>
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.correo}</td>
                    <td className="px-6 py-4 text-gray-700">{user.rol}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${user.estado === 'Activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatFechaConHoraFija(user.fecha_creacion)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="bg-[#4669AF] hover:bg-[#3a5a9b] text-white px-3 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                          onClick={() => handleEditar(user)}
                        >
                          <Edit className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                          onClick={() => handleEliminar(user.id_usuario, user.nombre)}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">No se encontraron usuarios</p>
              <p className="text-sm mt-1">
                Intenta con otros criterios de búsqueda
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal de Edición */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
            <p className="mb-4 text-gray-600">Editando a: <strong>{editingUser.nombre}</strong></p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
              >
                <option value="">Seleccione un rol</option>
                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre_rol}
                  </option>
                ))}
              </select>
            </div>

            {/* Mostrar selector de tienda solo si es Jefe de Tienda (ID 3 usualmente, verificar con roles) */}
            {roles.find(r => r.id_rol === selectedRole)?.nombre_rol === 'Jefe de Tienda' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tienda</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  value={selectedStore || ''}
                  onChange={(e) => setSelectedStore(Number(e.target.value))}
                >
                  <option value="">Seleccione una tienda</option>
                  {tiendas.map((tienda) => (
                    <option key={tienda.id_tienda} value={tienda.id_tienda}>
                      {tienda.nombre_tienda}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
                onClick={() => setEditingUser(null)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-[#4669AF] text-white rounded hover:bg-[#3a5a9b]"
                onClick={handleGuardarEdicion}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosRegis;
