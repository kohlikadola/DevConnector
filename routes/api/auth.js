const express = require('express');
const router =express.Router();
const auth = require('../../middleware/auth');
const User=require('../../models/User')
const  {check,validationResult}=require('express-validator');
const config=require('config');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
router.get('/',auth,async (req,res)=>{
  try{
    const user=await User.findById(req.user.id).select('-password');
    res.json(user);
  
  }catch(err){
    res.status(500).send('Server Error');
      
  }
});
router.post('/',[
  check('email','Email is required.').isEmail(),
  check('password','Password is required.').exists()
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
  const { email, password }=req.body;
    try{
       let user= await User.findOne({email});
      if(!user){
        return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
      }
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch){
        return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
      }

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
    }catch(err){
      console.error(err.message);
      res.status(500).send('Server Error');

    }

});
module.exports=router;
