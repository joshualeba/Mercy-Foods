import pyodbc
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

app = Flask(__name__,
            # Las plantillas HTML están en la carpeta raíz
            template_folder=project_root,
            # La base para los archivos estáticos (css, js, etc.) también es la raíz
            static_folder=project_root,
            # Le decimos a Flask que no use el prefijo /static en la URL
            static_url_path=''
            )

CORS(app)
bcrypt = Bcrypt(app)

DB_CONFIG = {
    'driver': '{ODBC Driver 18 for SQL Server};TrustServerCertificate=yes;',
    'server': '.',
    'database': 'MercyFoodDB',
    'trusted_connection': 'yes'
}

def get_db_connection():
    connection_string = (
        f"DRIVER={DB_CONFIG['driver']};"
        f"SERVER={DB_CONFIG['server']};"
        f"DATABASE={DB_CONFIG['database']};"
        f"UID=;PWD=;"
        f"Trusted_Connection={DB_CONFIG['trusted_connection']};"
    )
    return pyodbc.connect(connection_string)

# --- RUTAS PARA MOSTRAR LAS PÁGINAS HTML ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login.html')
def login_page():
    return render_template('login.html')

@app.route('/registro.html')
def registro_page():
    return render_template('registro.html')

@app.route('/restaurante-detalle.html')
def restaurante_detalle_page():
    return render_template('restaurante-detalle.html')

@app.route('/cliente-dashboard.html')
def cliente_dashboard():
    return render_template('cliente-dashboard.html')

@app.route('/restaurante-dashboard.html')
def restaurante_dashboard():
    return render_template('restaurante-dashboard.html')

@app.route('/repartidor-dashboard.html')
def repartidor_dashboard():
    return render_template('repartidor-dashboard.html')

@app.route('/favicon.ico')
def favicon():
    favicon_dir = os.path.join(app.root_path, '..', 'multimedia')
    return send_from_directory(favicon_dir, 'logo.png', mimetype='image/png')

# --- RUTAS DE LA API ---

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

        cursor.execute("SELECT id FROM Users WHERE email = ?", data.get('email'))
        if cursor.fetchone():
            return jsonify({'message': 'El correo electrónico ya está registrado.'}), 409

        base_sql = "INSERT INTO Users (email, password_hash, full_name, role"
        params = [data.get('email'), hashed_password, data.get('nombre'), role]

        if role == 'restaurante':
            base_sql += ", restaurant_address, cuisine_type, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?)"
            params.extend([data.get('direccion'), data.get('tipo'), data.get('telefono')])
        elif role == 'repartidor':
            base_sql += ", vehicle_type) VALUES (?, ?, ?, ?, ?)"
            params.append(data.get('vehiculo'))
        else:
            base_sql += ") VALUES (?, ?, ?, ?)"

        cursor.execute(base_sql, tuple(params))
        conn.commit()
        return jsonify({'message': '¡Cuenta creada con éxito!'}), 201

    except pyodbc.Error as ex:
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
            return jsonify({'message': 'Credenciales incorrectas...'}), 401

        return jsonify({'message': 'Inicio de sesión exitoso.', 'user': {'id': user_row.id, 'fullName': user_row.full_name, 'email': email, 'role': user_row.role}}), 200

    except pyodbc.Error as ex:
        return jsonify({'message': f'Error en la base de datos: {ex}'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/faq', methods=['GET'])
def get_faqs():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, question, answer FROM FAQ")
        faqs = cursor.fetchall()

        # Si la tabla está vacía, inserta datos de ejemplo la primera vez
        if not faqs:
            sample_faqs = [
                ('¿Qué métodos de pago aceptan?', 'Aceptamos pagos con tarjeta de crédito/débito y PayPal. Toda tu información de pago se maneja de forma segura y encriptada.'),
                ('¿Puedo seguir mi pedido en tiempo real?', '¡Sí! Una vez que tu pedido es aceptado, podrás ver su estado en tiempo real, desde "En preparación" hasta "Entregado" en la puerta de tu casa.'),
                ('Soy repartidor, ¿cómo funciona la asignación de pedidos?', 'Nuestro sistema asigna automáticamente los pedidos al repartidor disponible que se encuentre más cerca del restaurante para optimizar los tiempos de entrega.'),
                ('¿Qué hago si tengo un problema con mi pedido?', 'Contamos con un chat de soporte en vivo para ayudarte con cualquier inconveniente. Nuestro objetivo es darte una respuesta en el menor tiempo posible.')
            ]
            cursor.executemany("INSERT INTO FAQ(question, answer) VALUES (?,?)", sample_faqs)
            conn.commit()
            
            # Vuelve a consultar para obtener los datos recién insertados
            cursor.execute("SELECT id, question, answer FROM FAQ")
            faqs = cursor.fetchall()

        # Convierte los resultados a una lista de diccionarios para enviar como JSON
        faqs_list = []
        for row in faqs:
            faqs_list.append({'id': row.id, 'question': row.question, 'answer': row.answer})

        return jsonify({'faqs': faqs_list})

    except pyodbc.Error as ex:
        print(f"Error de base de datos en FAQ: {ex}")
        return jsonify({'message': f'Error en la base de datos: {ex}'}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)