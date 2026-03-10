def test_verify_access_token():
    from app.oauth2 import create_access_token, verify_access_token
    from app.schemas import TokenData

    # Create a token with a specific user_id
    data = {"user_id": "123"}
    token = create_access_token(data)

    # Verify the token and get the token data
    credentials_exception = Exception("Invalid credentials")
    token_data = verify_access_token(token, credentials_exception)

    # Assert that the token data contains the correct user_id
    assert isinstance(token_data, TokenData)
    assert token_data.id == "123"

test_verify_access_token()