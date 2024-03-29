const express = require('express');
const router =express.Router();
const {check,validationResult}=require('express-validator');
const auth=require('../../middleware/auth');
const  Post=require('../../models/Post');
const  User=require('../../models/User');
const  Profile=require('../../models/Profile');
//@route POST api/post
//@desc  Create a post
//@access Private
router.post('/',[auth,[
  check('text','Text is required.').not().isEmpty()
]],
async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  try{
  const user=await User.findById(req.user.id).select('-password');
  const newPost=new Post({
    text:req.body.text,
    name:user.name,
    avatar:user.avatar,
    user:req.user.id
  });
    const post=await newPost.save();
    res.json(post);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route GET api/post
//@desc  Get all post
//@access Private
router.get('/',auth,async(req,res)=>{
  try{
    const posts=await Post.find().sort({date: -1});
    res.json(posts);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});
//@route GET api/post/:id
//@desc  Get post by id
//@access Private
router.get('/:id',auth,async(req,res)=>{
  try{
    const posts=await Post.findById(req.params.id);
    if(!posts){
      return res.status(404).json({msg:'Post Not Found'});
    }
    res.json(posts);
  }catch(err){
    console.error(err.message);
     if(err.kind==='ObjectId'){
      return res.status(404).json({msg:'Post Not Found'});
    }
    res.status(500).send('Server Error');
  }

});
//@route DELETE api/post/:id
//@desc  Delete all post
//@access Private
router.delete('/:id',auth,async(req,res)=>{
  try{
    const posts=await Post.findById(req.params.id);
     if(!posts){
      return res.status(401).json({msg:'Post Not Found'});
    }

    if(posts.user.toString()!=req.user.id){
      return res.status(401).json({msg:'User Not Authorized'});
    }
    await posts.deleteOne();
    res.json({msg:'Post Deleted'});
  }catch(err){
    console.error(err.message);
     if(err.kind==='ObjectId'){
      return res.status(404).json({msg:'Post Not Found'});
    }

    res.status(500).send('Server Error');
  }

});
//@route PUT api/post/like/:id
//@desc  Like a  post
//@access Private
router.put('/like/:id',auth,async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id);
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
      return res.status(400).json({msg:'Post already Liked'});
    }
    post.likes.unshift({user:req.user.id});
    await post.save();

    res.json(post.likes);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route PUT api/post/unlike/:id
//@desc  Like a  post
//@access Private
router.put('/unlike/:id',auth,async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id);
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
      return res.status(400).json({msg:'Post not  Liked'});
    }
    //post.likes.unshift({user:req.user.id});
    const removeindex=post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeindex,1);
    await post.save(); res.json(post.likes);



  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route POST api/post/comment/:id
//@desc  Comment a post
//@access Private

router.post('/comment/:id',[auth,[
  check('text','Text is required.').not().isEmpty()
]],
async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  try{
  const user=await User.findById(req.user.id).select('-password');
  const post= await Post.findById(req.params.id);
    const newcomment={
    text:req.body.text,
    name:user.name,
    avatar:user.avatar,
    user:req.user.id
  };
    post.comments.unshift(newcomment)
    await post.save();
    res.json(post.comments);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route DELETE api/post/:id/:comment_id
//@desc  Delete comment
//@access Private
router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
  try{
   const post=await Post.findById(req.params.id);
    const comment=post.comments.find(comment=> comment.id === req.params.comment_id);
    if(!comment){
      return res.status(404).json({msg:'Comment doesnot exist'});
    }
    if(comment.user.toString()!==req.user.id){
      return res.status(401).json({msg:'User not authorized.'});
    }
   const removeindex = post.comments.findIndex(comment => comment.id === req.params.comment_id);

    post.comments.splice(removeindex,1);
    await post.save(); res.json(post.comments);


  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});
module.exports=router;
