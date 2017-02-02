import { find, filter } from 'lodash';
import { pubsub } from './subscriptions';
import { each } from 'lodash';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/meteor');



var Post = mongoose.model('posts1', { title: String, details: String, cat: String, images: [String], tags: [String], cats: [String], person: String});

const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
];

const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'GraphQL Rocks', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
];

const resolveFunctions = {
  Query: {
    posts(_,{ limit = 10 }) {
      //return posts;
      return new Promise((resolve, reject) => {
        Post.find().limit(limit).exec((err, posts) => {
          if (err) reject(err)
          else {
            each(posts, (post)=> {
              //post.details= post.details.replace(/\t/g, '').replace(/\r/g, '').replace(/\n/g, '');
            })
            resolve(posts)
          }
        })
      })
    },
    author(_, { id }) {
      return find(authors, { id: id });
    },
    postsByCategory(_, { cats, limit = 10 }) {
      return new Promise((resolve, reject) => {
        Post.find({cats:{$in:cats}}).limit(limit).exec((err, posts) => {
          if (err) reject(err)
          else {
            each(posts, (post)=> {
              //post.details= post.details.replace(/\t/g, '').replace(/\r/g, '').replace(/\n/g, '');
            })
            resolve(posts)
          }
        })
      })
    },
  },
  Mutation: {
    upvotePost(_, { postId }) {
      const post = find(posts, { id: postId });
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      pubsub.publish('postUpvoted', post);
      return post;
    },
  },
  Subscription: {
    postUpvoted(post) {
      return post;
    },
  },
  Author: {
    posts(author) {
      return filter(posts, { authorId: author.id });
    },
  },
  Post: {
    author(post) {
      return find(authors, { id: post.authorId });
    },
  },
};

export default resolveFunctions;
