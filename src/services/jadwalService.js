import axios from 'axios';

const API = 'http://localhost:3001/jadwal';

export const jadwalService = {
  getAll: async () => (await axios.get(API)).data,

  createBulk: async (data) => {
    const promises = data.map(item =>
      axios.post(API, { id: Date.now() + Math.random(), ...item })
    );
    await Promise.all(promises);
    return data;
  },

  remove: async (id) => {
    await axios.delete(`${API}/${id}`);
    return id;
  }
};