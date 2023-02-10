import request from './request.js';
import addID from './funcaddid.js';
import { render } from './view.js';

const hasPost = (state, newPost) => !state.postsList.every((post) => post.link !== newPost.link);

const setTime = (state) => setTimeout(() => {
    state.feedList.forEach((feed) => request(feed.link)
        .then((data) => {
            switch (data) {
                case 'networkError':
                case 'rssError':
                    return;
                default:
                    addID(state, data);
                    const newPosts = data.posts.filter((post) => !hasPost(state, post));
                    state.postsList = [...state.postsList, ...newPosts];
                    render(state);
            }
        }));
        return setTime(state);
    }, 5000, state);

export default (state) => setTime(state);