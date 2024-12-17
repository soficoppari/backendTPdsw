import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ORM } from '../shared/db/orm.js';
import { Usuario } from '../Usuario/usuario.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const em = ORM.em;

async function login(req: Request, res: Response) {
  console.log(req.body); // Agrego este log para ver los datos recibidos
  const { email, contrasenia } = req.body;

  try {
    // Verifica si JWT_SECRET está en el entorno
    if (!process.env.JWT_SECRET) {
      throw new Error(
        'JWT_SECRET no está configurado en las variables de entorno'
      );
    }

    // Validar que el email y la contraseña no estén vacíos
    if (!email || !contrasenia) {
      return res
        .status(400)
        .json({ message: 'Email y contraseña son requeridos.' });
    }

    // Buscar en ambas tablas
    const usuario = await em.findOne(Usuario, { email });
    const veterinario = await em.findOne(Veterinario, { email });

    if (!usuario && !veterinario) {
      return res.status(404).json({ message: 'Credenciales inválidas.' });
    }

    // Determinar tipo de cuenta
    const account = usuario || veterinario;
    const role = usuario ? 'usuario' : 'veterinario';

    // Verificar que account no es null para TypeScript
    if (!account) {
      throw new Error(
        'Error inesperado: No se encontró la cuenta después de la verificación.'
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      contrasenia,
      account.contrasenia
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: account.id, email: account.email, role },
      process.env.JWT_SECRET as string, // Confirma que el valor es seguro
      { expiresIn: '1h' }
    );

    // Enviar respuesta con el token, el rol y el id
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      role,
      id: account.id, // Asegúrate de incluir el id aquí
    });
  } catch (error: any) {
    console.error(error); // Esto es útil para depurar errores
    res.status(500).json({ message: error.message });
  }
}

export { login };
