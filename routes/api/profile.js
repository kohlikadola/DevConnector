const express = require('express');
const router =express.Router();
const auth=require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User=require('../../models/User');
const {check,validationResult}=require('express-validator');
//@route GET/api/me
//@desc Get Current Users Profile
//@access Private
router.get('/me',auth,async (req,res)=>{
  try{
    const profile=await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
    if(!profile){
      return res.status(400).json({msg:'There is no profile for this user.'});
    }
    res.json(profile);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');

  }
});
//@route POST api/profile
//@desc Create or update profile
//@access Private
router.post('/',[auth,[
  check('status','Status is Required').not().isEmpty(),
  check('skills','Skills is Required').not().isEmpty()
]],
  async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors:errors.array()});
    }
    const{
      company,website,
      location,bio,
      status,githubusername,
      skills,youtube,
      facebook,twitter,
      linkedin,instagram
    }=req.body;
    //BuildProfile
    const profileFields={};
    profileFields.user=req.user.id;
    if(company){
      profileFields.company=company;
    }
    if(website){
      profileFields.website=website;
    }
    if(location){
       profileFields.location=location;
    }
    if(bio){
      profileFields.bio=bio;
    }
    if(status){
      profileFields.status=status;
    }
    if(githubusername){
      profileFields.githubusername=githubusername;
    }
    if(skills){
      profileFields.skills=skills.split(',').map(skill=>skill.trim());
    }
    profileFields.social={}
    if(youtube){
      profileFields.social.youtube=youtube;
    }
     if(twitter){
      profileFields.social.twitter=twitter;
    }        
     if(linkedin){
      profileFields.social.linkedin=linkedin;
    }
    if(instagram){
      profileFields.social.instagram=instagram;
    }
    if(facebook){
      profileFields.social.facebook=facebook;
    }
    try{
      let profile=await Profile.findOne({user:req.user.id});
      if(profile){
        profile=await Profile.findOneAndUpdate({user:req.user.id},
          {$set:profileFields},
          {new:true});
        return res.json(profile)
      }
      profile=new Profile(profileFields);
      await profile.save();
      res.json(profile);

    }catch(err){
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
//@route POST api/profile
//@desc  Get all Profiles
//@access Public
router.get('/',async(req,res)=>{
  try{
    const profiles=await Profile.find().populate('user',['name','avatar']);
    res.json(profiles);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route POST api/profile/user/:user_id
//@desc  Get Profile by user ID
//@access Public
router.get('/user/:user_id',async(req,res)=>{
  try{
    const profiles=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
    if(!profiles){
      return res.status(400).json({msg:'There is no profile for this user.'});
    }
    res.json(profiles);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route DELETE api/profile
//@desc  DELETE Profiles
//@access Private
router.delete('/',auth,async(req,res)=>{
  try{
   await Profile.findOneAndDelete({ user: req.user.id });
   await User.findOneAndDelete({_id:req.user.id});

    res.json({msg:'User deleted'});

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route PUT api/profile/experience
//@desc  Add profile experience
//@access Private
router.put('/experience',[auth,[
  check('title','Title is required').not().isEmpty(),
  check('company','Company is required').not().isEmpty(),
  check('from','From Date is required').not().isEmpty()
]],async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  const {
    title,
    company,
    location,
    from,to,
    current,
    description

  }=req.body;
  const newExp={
    title,
    company,location,
    from,to,current,
    description
  }
  try{
    const profile=await Profile.findOne({user:req.user.id});
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route DELETE api/profile/experience/:exp_id
//@desc  Delete exp
//@access Private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
  try{
    const profile=await Profile.findOne({user:req.user.id});
    const removeIndex=profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex,1);
    await profile.save();
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route PUT api/profile/education
//@desc  Add profile education
//@access Private
router.put('/education',[auth,[
  check('school','School is required').not().isEmpty(),
  check('degree','degree is required').not().isEmpty(),
  check('fieldofstudy','fieldofstudy is required').not().isEmpty(),
  check('from','From Date is required').not().isEmpty()
]],async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  const {
    school,
    degree,
    fieldofstudy,
    from,to,
    current,
    description

  }=req.body;
  const newEdu={
    school,
    degree,fieldofstudy,
    from,to,current,
    description
  }
  try{
    const profile=await Profile.findOne({user:req.user.id});
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route DELETE api/profile/education/:edu_id
//@desc  Delete ed
//@access Private
router.delete('/education/:exp_id',auth,async(req,res)=>{
  try{
    const profile=await Profile.findOne({user:req.user.id});
    const removeIndex=profile.education.map(item=>item.id).indexOf(req.params.edu_id);
    profile.education.splice(removeIndex,1);
    await profile.save();
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports=router;