// React imports
import React, { useState } from "react";
import PropTypes from "prop-types";

// Redux imports
import { connect } from "react-redux";
import { getCurrUser, getToken } from "../../../selectors/auth";

import { Link } from "react-router5";
import { checkAndHandleError } from "../../../lib/general";
import { patchPost, deletePost } from "../../../api/bulletins";

const DiscussionPost = ({ post, currUser, token }) => {
  const [deleted, updateDeleted] = useState(false);
  const [edit, setEdit] = useState(false);
  const [reply, updateReply] = useState(post.content);
  const [currPost, updateCurrPost] = useState(post);

  const editHandler = () => {
    setEdit(true);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (reply === "") return;
    const params = { content: reply };

    const response = await patchPost(token, post.id, params);

    if (checkAndHandleError(response)) {
      setEdit(false);
      updateCurrPost(response.data.data);
    }
  };

  const deleteHandler = async () => {
    // eslint-disable-next-line no-restricted-globals
    const confirmDelete = confirm("Are you sure?"); // eslint-disable-line no-alert
    if (!confirmDelete) return;

    const response = await deletePost(token, post.id);

    if (checkAndHandleError(response)) {
      updateDeleted(true);
    }
  };

  const editControls = () => {
    if (!post.userID) return null;
    if (post.userID === currUser.id || currUser.admin) {
      return (
        <>
          <button className="inline-button" type="button" onClick={editHandler}>
            Edit
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={deleteHandler}
          >
            Delete
          </button>
          <br />
          <br />
        </>
      );
    }
    return null;
  };

  const commentContent = () => {
    if (!deleted && !edit) {
      return (
        <>
          <div className="comment-content">
            <b>
              {currPost.user ? (
                <Link
                  routeName="facebook.users"
                  routeParams={{ userID: currPost.userID }}
                >
                  {currPost.user.name}
                </Link>
              ) : (
                currPost.exUserName
              )}
            </b>
            &nbsp;
            <em>{new Date(currPost.createdTime).toDateString()}</em>
            <br />
            <br />
            {editControls()}
            {currPost.content}
          </div>
        </>
      );
    }

    if (deleted) return null;

    return (
      <form onSubmit={submitHandler}>
        <textarea
          id="post_content"
          value={reply}
          onChange={(event) => {
            updateReply(event.target.value);
          }}
        >
          {currPost.content}
        </textarea>
        <input
          type="submit"
          value="Save"
          className="submit"
          data-disable-with="Save"
        />
      </form>
    );
  };

  return <div className="comment">{commentContent()}</div>;
};

DiscussionPost.propTypes = {
  post: PropTypes.object.isRequired,
  currUser: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
};

DiscussionPost.defaultProps = {};

const mapStateToProps = (state) => ({
  currUser: getCurrUser(state),
  token: getToken(state),
});

export default connect(mapStateToProps)(DiscussionPost);
