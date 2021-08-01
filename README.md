# serverHuD
Web based heads up display for servers

## ToDo:

- Replace 'any' with types where I haven't.
- Implement independent server page.
- Style server page.
- Getting server uptime.
- Implementing an uptime graph.
- Implementing PWA
- Client side form validation.
- Make it pretty.
- Refactor
- hud-server authentication.
- AddServer, optional hud-server field.

## Backend API

  ### /login POST

  {
    "email": your_email_string,
    "password": your_password_string
  }

  ### /register POST
  {
    "email": your_email_string,
    "password": your_password_string
  }

  ### /servers GET Returns
  {
    url: url_string,
    name: name_string,
    sslStatus: boolean_string,
    sslExpiry: integer_days_to_expiry,
  }

