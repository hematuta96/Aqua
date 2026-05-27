from flask import Flask, render_template, request, redirect, flash

app = Flask(__name__)
app.secret_key = "aquasafe"


@app.route('/')
def home():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    if username == "admin" and password == "1234":
        return redirect('/index')
    else:
        flash("Invalid username or password")
        return redirect('/')


@app.route('/signup')
def signup():
    return render_template('signup.html')


@app.route('/index')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)