import express from "express";
const router = express.Router();



router.get('/login', (req,res) => {

    return res.send({
        "screenTitle": "Login Page",
        "fields": [
          {
            "type": "textField",
            "placeholder": "PhoneNumber ",
            "fieldType": "PhoneNumber",
            "controller": "phoneNumberController",
          },
          {
            "type": "textField",
            "placeholder": "Password",
            "fieldType": "password"
          }
        ],
        "actions": [
          {
            "type": "button",
            "label": "Login",
            "action": "submitForm"
          }
        ]
      }
      )
});


router.get('/signUp', (req,res) => {

  return res.send({
      "screenTitle": "SIGN UP  JULIA",
      "fields": [

        {
          "type": "textField",
          "placeholder": "phoneNumber",
          "fieldType": "email"
        },
        
        
      ],
      "actions": [
        {
          "type": "button",
          "label": "Login",
          "action": "submitForm"
        }
      ]
    }
    )
});



  export const SBUI = {
    router
  }


