// React imports
import React, { useState } from "react";
import PropTypes from "prop-types";

// Redux imports
import { connect } from "react-redux";

// External Imports
import { actions } from "redux-router5";
import { checkAndHandleError } from "../../../lib/general";
import { getToken } from "../../../selectors/auth";

import { postDiscussion } from "../../../api/bulletins";

const DiscussionsNew = ({ token, navigateTo }) => {
  const [errors] = useState([]);

  const [title, updateTitle] = useState("");
  const [content, updateContent] = useState("");

  const renderErrors = () => {
    if (!errors || errors.length === 0) return null;

    return (
      <div id="error_explanation">
        <b>{`${errors.length} errors:`}</b>
        <ul>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    );
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    const params = {
      title,
      content,
    };

    const response = await postDiscussion(token, params);

    if (checkAndHandleError(response)) {
      navigateTo("discussions");
    }
  };

  return (
    <article className="list-creation">
      <section>
        {renderErrors()}
        <form onSubmit={submitHandler}>
          <br />
          <input
            placeholder="Title"
            type="text"
            id="post_title"
            value={title}
            onChange={(event) => updateTitle(event.target.value)}
          />
          <textarea
            placeholder="Body"
            id="post_content"
            value={content}
            onChange={(event) => updateContent(event.target.value)}
          />
          <input
            type="submit"
            value="Submit"
            className="submit"
            data-disable-with="Submit"
          />
        </form>
      </section>
    </article>
  );
};

DiscussionsNew.propTypes = {
  token: PropTypes.string.isRequired,
  navigateTo: PropTypes.object.isRequired,
};

DiscussionsNew.defaultProps = {};

const mapStateToProps = (state) => ({
  token: getToken(state),
});

const mapDispatchToProps = (dispatch) => ({
  navigateTo: (location, params, opts) =>
    dispatch(actions.navigateTo(location, params, opts)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscussionsNew);
