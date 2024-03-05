import axios from 'axios';

export const api = axios.create({
	baseURL: 'https://api.fillout.com',
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		Authorization: `Bearer ${process.env.FILLOUT_API_KEY}`,
	},
});

export default api;
