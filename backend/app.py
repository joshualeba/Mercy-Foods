from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os

#CONFIGURACIoN

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance/mercyfood.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
#MODELO DE USUARIO
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    restaurant_address = db.Column(db.String(200), nullable=True)
    cuisine_type = db.Column(db.String(50), nullable=True)
    contact_phone = db.Column(db.String(15), nullable=True)
    vehicle_type = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return f"User('{self.full_name}', '{self.email}', '{self.role}')"

#RUTAS DE LA API
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    role = data.get('role')

    user_exists = User.query.filter_by(email=data.get('email')).first()
    if user_exists:
        return jsonify({'message': 'El correo electrónico ya está registrado.'}), 409

    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')

    if role == 'cliente':
        new_user = User(email=data.get('email'), password_hash=hashed_password, full_name=data.get('nombre'), role='cliente')
    elif role == 'restaurante':
        new_user = User(email=data.get('email'), password_hash=hashed_password, full_name=data.get('nombre'), role='restaurante',
                        restaurant_address=data.get('direccion'), cuisine_type=data.get('tipo'), contact_phone=data.get('telefono'))
    elif role == 'repartidor':
        new_user = User(email=data.get('email'), password_hash=hashed_password, full_name=data.get('nombre'), role='repartidor',
                        vehicle_type=data.get('vehiculo'))
    else:
        return jsonify({'message': 'Rol no válido.'}), 400

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': '¡Cuenta creada con éxito!'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.'}), 401

    return jsonify({
        'message': 'Inicio de sesión exitoso.',
        'user': {'id': user.id, 'fullName': user.full_name, 'email': user.email, 'role': user.role}
    }), 200

# iniciar servidor
if __name__ == '__main__':
    with app.app_context():
        if not os.path.exists('instance'):
            os.makedirs('instance')
        db.create_all()

    app.run(debug=True, port=5000)
