from models import db, User, Blog, Exoplanet, Quiz, Question

# Create a sample user (if not already existing)
user = User(username='astrofan', email='astrofan@example.com')
user.set_password('securepassword123')
db.session.add(user)
db.session.commit()

# Create a sample exoplanet without a quiz
exoplanet_no_quiz = Exoplanet(
    name='Gliese 667 Cc',
    description='Gliese 667 Cc is an exoplanet orbiting the star Gliese 667 C.',
    image='https://example.com/images/gliese-667-cc.jpg',  # Replace with a valid image URL or path
    story='Gliese 667 Cc is located in the habitable zone of its star, making it a candidate for potential habitability.'
)
db.session.add(exoplanet_no_quiz)
db.session.commit()

print('Exoplanet without quiz added successfully.')

# Create a sample exoplanet
exoplanet = Exoplanet(
    name='Kepler-22b',
    description='Kepler-22b is a super-Earth exoplanet orbiting in the habitable zone of its star.',
    image='kep.jpg',  # Replace with a valid image URL or path
    story='Discovered by NASA\'s Kepler mission, Kepler-22b has intrigued scientists with its Earth-like qualities.'
)
db.session.add(exoplanet)
db.session.commit()

# Create a quiz for Kepler-22b
quiz = Quiz(exoplanet=exoplanet)
db.session.add(quiz)
db.session.commit()

# Add questions to the quiz
question1 = Question(
    question_text='What is the mass of Kepler-22b compared to Earth?',
    option_a='Less than Earth',
    option_b='Equal to Earth',
    option_c='About 2.4 times Earth\'s mass',
    option_d='About 5 times Earth\'s mass',
    correct_option='c',
    quiz=quiz
)

question2 = Question(
    question_text='In which year was Kepler-22b discovered?',
    option_a='2009',
    option_b='2011',
    option_c='2013',
    option_d='2015',
    correct_option='c',
    quiz=quiz
)

question3 = Question(
    question_text='Which space telescope discovered Kepler-22b?',
    option_a='Hubble Space Telescope',
    option_b='Kepler Space Telescope',
    option_c='Spitzer Space Telescope',
    option_d='James Webb Space Telescope',
    correct_option='b',
    quiz=quiz
)

db.session.add_all([question1, question2, question3])
db.session.commit()

print('Sample exoplanet with quiz added successfully.')
