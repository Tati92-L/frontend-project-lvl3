const parsingFunc = (string) => {
  const postItems = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const error = new Error('Ресурс не содержит валидный RSS');
    throw error;
  }

  const feedHeader = doc.querySelector('channel > title').textContent;
  const feedInfo = doc.querySelector('channel > description').textContent;
  const feeds = [{ feedHeader, feedInfo }];
  const posts = doc.querySelectorAll('channel > item');
  posts.forEach((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;
    const postInfo = { postTitle, postDescription, postLink };
    postItems.unshift(postInfo);
  });
  return { feeds, postItems };
};
export default parsingFunc;
