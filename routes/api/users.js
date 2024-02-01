const express = require('express');
const router =express.Router();
const gravatar=require('gravatar');
const {check, validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
const User=require('../../models/User');
const jwt=require('jsonwebtoken');
const config=require('config')
router.post('/',[
  check('name','Name is required').not().isEmpty(),
  check('email','Valid Email is reqd.').isEmail(),
  check('password','Please enter a password of length greater than 6').isLength({min:6})
],
  async(req,res)=>{
  const errors= validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors:errors.array()});
    }
  //See if user
  //Get avatar
  //Encrypt PSK
  //Return Json Token
  const { name, email, password }=req.body;
    try{
       let user= await User.findOne({email});
      if(user){
        return res.status(400).json({errors:[{msg:'User already exists'}]});
      }
      const avatar=gravatar.url(email,{
        s:'200',
        r:'pg',
        d:'mm'
      })
      user =  new User({
        name,
        email,
        avatar,
        password
      });
      const salt=await bcrypt.genSalt(10);
      user.password=await bcrypt.hash(password,salt);
      await user.save();
      //payload
      const payload={
        user:{
          id:user.id
        }
      }
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {expiresIn:3600000},
        (err,token)=>{
          if(err){ throw err;}
         // return res.status(500).json({ errors: [{ msg: 'Token generation failed' }] });
          res.json({token});
        }
      );
      console.log(req.body);
    



    }catch(err){
      console.error(err.message);
      res.status(500).send('Server Error');

    }

});
module.exports=router;
