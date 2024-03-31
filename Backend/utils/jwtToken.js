// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  
    const Token = user.getJWTToken();

    res.status(statusCode)
    .cookie("token", Token, {
      expires: new Date(Date.now() + 432000000),
      httpOnly: true,
    })
    .json({//coockie set success but not accessed in middelware for auth
      success: true,
      user,
      Token,
    });
  };
  
export default sendToken;