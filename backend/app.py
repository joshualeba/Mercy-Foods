import pyodbc
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

DB_CONFIG = {
    'driver': '{ODBC Driver 18 for SQL Server};TrustServerCertificate=yes;',
    'server': '.',
    'database': 'MercyFoodDB',
    'trusted_connection': 'yes'
}

def get_db_connection():
    # Establece una nueva conexión a la base de datos.
    connection_string = (
        f"DRIVER={DB_CONFIG['driver']};"
        f"SERVER={DB_CONFIG['server']};"
        f"DATABASE={DB_CONFIG['database']};"
        f"UID=;PWD=;" # Se dejan vacíos para la autenticación de Windows
        f"Trusted_Connection={DB_CONFIG['trusted_connection']};"
    )
    return pyodbc.connect(connection_string)


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    role = data.get('role')

    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'El correo y la contraseña son requeridos.'}), 400

    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar si el correo ya existe
        cursor.execute("SELECT id FROM Users WHERE email = ?", data.get('email'))
        if cursor.fetchone():
            return jsonify({'message': 'El correo electrónico ya está registrado.'}), 409

        # Construir la consulta de inserción
        base_sql = "INSERT INTO Users (email, password_hash, full_name, role"
        params = [data.get('email'), hashed_password, data.get('nombre'), role]

        if role == 'restaurante':
            base_sql += ", restaurant_address, cuisine_type, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?)"
            params.extend([
                data.get('direccion'),
                data.get('tipo'),
                data.get('telefono')
            ])
        elif role == 'repartidor':
            base_sql += ", vehicle_type) VALUES (?, ?, ?, ?, ?)"
            params.append(data.get('vehiculo'))
        else: # Cliente
            base_sql += ") VALUES (?, ?, ?, ?)"

        cursor.execute(base_sql, tuple(params))
        conn.commit()

        return jsonify({'message': '¡Cuenta creada con éxito!'}), 201

    except pyodbc.Error as ex:
        print(f"Error de base de datos en registro: {ex}")
        return jsonify({'message': f'Error en la base de datos: {ex}'}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, password_hash, full_name, role FROM Users WHERE email = ?", email)
        user_row = cursor.fetchone()

        if not user_row or not bcrypt.check_password_hash(user_row.password_hash, password):
            return jsonify({'message': 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.'}), 401

        return jsonify({
            'message': 'Inicio de sesión exitoso.',
            'user': {
                'id': user_row.id,
                'fullName': user_row.full_name,
                'email': email,
                'role': user_row.role
            }
        }), 200

    except pyodbc.Error as ex:
        print(f"Error de base de datos en login: {ex}")
        return jsonify({'message': f'Error en la base de datos: {ex}'}), 500
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    app.run(debug=True, port=5000)