export default (state, data) => {
    const lastFeedID = state.feedList.length ? state.feedList[state.feedList.length - 1].id : 0;
    let lastPostID = state.postsList.length ? state.postsList[state.feedList.length - 1].postID : 0;
    data.feed.id = lastFeedID + 1;
    data.posts.forEach((post) => {
        post.postID = lastPostID + 1;
        lastPostID += 1;
        post.feedID = lastFeedID + 1;
    });
};
