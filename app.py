# backend/app.py

from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import os
from models import db, User, Blog, Exoplanet, Quiz, Question
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='../frontend', static_url_path='/')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key')  # Use environment variable
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///exoplanet.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')  # Use environment variable

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
socketio = SocketIO(app, cors_allowed_origins="*")
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Routes

## User Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Please provide username, email, and password'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    access_token = create_access_token(identity=user.id)
    return jsonify({'token': access_token}), 201

## User Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Please provide email and password'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

## Get Blogs
@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    blogs = Blog.query.order_by(Blog.created_at.desc()).all()
    output = []
    for blog in blogs:
        output.append({
            'id': blog.id,
            'title': blog.title,
            'content': blog.content,
            'author': blog.author.username,
            'created_at': blog.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(output), 200

## Create Blog
@app.route('/api/blogs', methods=['POST'])
@jwt_required()
def create_blog():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'message': 'Please provide title and content for the blog'}), 400
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    blog = Blog(title=data['title'], content=data['content'], author=user)
    db.session.add(blog)
    db.session.commit()
    return jsonify({'message': 'Blog created successfully'}), 201

## Get Exoplanets
@app.route('/api/exoplanets', methods=['GET'])
def get_exoplanets():
    exoplanets = Exoplanet.query.all()
    output = []
    for planet in exoplanets:
        output.append({
            'id': planet.id,
            'name': planet.name,
            'description': planet.description,
            'image': planet.image,
            'story': planet.story
        })
    return jsonify(output), 200

## Get Exoplanet Detail
@app.route('/api/exoplanets/<int:planet_id>', methods=['GET'])
def get_exoplanet(planet_id):
    planet = Exoplanet.query.get(planet_id)
    if not planet:
        return jsonify({'message': 'Exoplanet not found'}), 404
    quiz = planet.quiz
    if quiz:
        questions = []
        for q in quiz.questions:
            questions.append({
                'id': q.id,
                'question_text': q.question_text,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d
            })
    else:
        questions = []
    output = {
        'id': planet.id,
        'name': planet.name,
        'description': planet.description,
        'image': planet.image,
        'story': planet.story,
        'quiz': questions
    }
    return jsonify(output), 200

## Complete Quiz and Become Citizen
# backend/app.py
@app.route('/api/exoplanets/<int:planet_id>/complete', methods=['POST'])
@jwt_required()
def complete_quiz(planet_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    planet = Exoplanet.query.get(planet_id)
    
    if not planet:
        return jsonify({'message': 'Exoplanet not found'}), 404

    if planet in user.planets:
        return jsonify({'message': 'Already a citizen of this exoplanet'}), 400

    data = request.get_json()
    if not data or 'answers' not in data:
        return jsonify({'message': 'No answers provided'}), 400

    user_answers = data['answers']  # Expected format: { "question_id": "selected_option", ... }

    quiz = planet.quiz
    if quiz:
        questions = Question.query.filter_by(quiz_id=quiz.id).all()
        
        # Initialize pass status
        passed = True
        incorrect_questions = []

        for question in questions:
            correct_option = question.correct_option.lower()
            user_answer = user_answers.get(str(question.id), "").lower()

            if user_answer != correct_option:
                passed = False
                incorrect_questions.append({
                    'question_id': question.id,
                    'correct_option': correct_option,
                    'your_answer': user_answer
                })

        if passed:
            user.planets.append(planet)
            db.session.commit()
            return jsonify({'message': f'Successfully became a citizen of {planet.name}'}), 200
        else:
            return jsonify({
                'message': 'You did not pass the quiz. Please try again.',
                'incorrect_questions': incorrect_questions
            }), 400
    else:
        # No quiz associated, directly grant access
        user.planets.append(planet)
        db.session.commit()
        return jsonify({'message': f'Successfully became a citizen of {planet.name}'}), 200

## Get User Details
@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'message': 'Access denied'}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email}), 200



# Serve Frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join('../frontend', path)):
        return send_from_directory('../frontend', path)
    else:
        return send_from_directory('../frontend', 'index.html')

# SocketIO Events
@socketio.on('join')
def handle_join(data):
    room = data['room']
    user = data['user']
    join_room(room)
    emit('status', {'msg': f'{user} has entered the room.'}, room=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    user = data['user']
    msg = data['msg']
    emit('message', {'user': user, 'msg': msg}, room=room)

@socketio.on('leave')
def handle_leave(data):
    room = data['room']
    user = data['user']
    leave_room(room)
    emit('status', {'msg': f'{user} has left the room.'}, room=room)

if __name__ == '__main__':
    # Setup logging
    import logging
    from logging.handlers import RotatingFileHandler

    handler = RotatingFileHandler('error.log', maxBytes=100000, backupCount=3)
    handler.setLevel(logging.ERROR)
    app.logger.addHandler(handler)
    
    socketio.run(app, debug=True)
