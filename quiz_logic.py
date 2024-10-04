# backend/quiz_logic.py

from models import Quiz, Question

def check_answers(quiz_id, user_answers):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return False, "Quiz not found."

    correct_answers = {q.id: q.correct_option for q in quiz.questions}
    score = 0

    for question_id, user_answer in user_answers.items():
        correct_answer = correct_answers.get(question_id)
        if correct_answer and user_answer.strip().upper() == correct_answer:
            score += 1

    total_questions = len(correct_answers)
    passed = score == total_questions

    return passed, f"You answered {score} out of {total_questions} questions correctly."

# Example usage
user_answers = {
    1: 'B',  # Assuming question IDs are 1, 2, etc.
    2: 'A',
    3: 'A',
    4: 'A'
}

passed, message = check_answers(quiz_id=1, user_answers=user_answers)
print(message)
