import bcrypt

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

plain = "mypassword"
hashed = get_password_hash(plain)
print("Hash:", hashed)
print("Verify:", verify_password(plain, hashed))
print("Verify wrong:", verify_password("wrong", hashed))
