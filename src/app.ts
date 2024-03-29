import express from 'express';
import morgan from './utils/morgan';
import router from './routes';

export const app = express();

app.use(morgan);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', router);

// not found handler
app.use((req, res) => {
	res.status(404).json({ message: 'Not Found' });
});
