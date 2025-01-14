// React imports
import React, { useState, useEffect } from "react";
import PaginationButtons from "../../PaginationButtons";
import { Line } from "../../Skeleton";

// Redux/Routing imports
import { useAppSelector } from "../../../lib/store";
import { getCurrUser, getWSO } from "../../../lib/authSlice";

// Additional Imports
import { Link, useNavigate } from "react-router-dom";
import { format } from "timeago.js";

const DiscussionIndex = () => {
  const currUser = useAppSelector(getCurrUser);
  const wso = useAppSelector(getWSO);

  const navigateTo = useNavigate();

  const perPage = 20;
  const [page, updatePage] = useState(0);
  const [total, updateTotal] = useState(0);
  const [threads, updateThreads] = useState(null);

  // Load threads depending on what page it is
  const loadThreads = async (newPage) => {
    const params = {
      limit: 20,
      offset: newPage * perPage,
      preload: ["user", "postsUsers"],
    };
    try {
      const discussionsResponse = await wso.bulletinService.listDiscussions(
        params
      );

      updateThreads(discussionsResponse.data);
      updateTotal(discussionsResponse.paginationTotal);
    } catch (error) {
      navigateTo("/error", { replace: true, state: { error } });
    }
  };

  useEffect(() => {
    loadThreads(0);
    // eslint-disable-next-line
  }, [wso]);

  // Handles clicking of the next/previous page
  const clickHandler = (number) => {
    if (number === -1 && page > 0) {
      loadThreads(page - 1);
      updatePage(page - 1);
    } else if (number === 1 && total - (page + 1) * perPage > 0) {
      loadThreads(page + 1);
      updatePage(page + 1);
    }
  };

  // Handles selection of page
  const selectionHandler = (newPage) => {
    updatePage(newPage);
    loadThreads(newPage);
  };

  // Gets the username of the last commenter.
  const lastCommenter = (thread) => {
    if (!thread.posts) return "";
    const last = thread.posts[thread.posts.length - 1];
    if (!last) return "WSO User";
    if (last.user) return last.user.name;
    if (last.exUserName !== "") return last.exUserName;
    return "WSO User";
  };

  // Generates thread title.
  const threadTitle = (thread) => {
    return (
      <h5>
        <b>
          <Link to={`/discussions/threads/${thread.id}`}>{thread.title}</Link>
        </b>
      </h5>
    );
  };

  // Gets the username of the last commenter.
  const threadStarter = (thread) => {
    if (thread.user) return thread.user.name;
    if (thread.exUserName !== "") return thread.exUserName;
    return "WSO User";
  };

  // Generates Started by
  const startedBy = (thread) => {
    return (
      <div className="small-font">
        Started {new Date(thread.createdTime).toDateString()}
        {` by ${threadStarter(thread)}`}
      </div>
    );
  };

  // Generates post information
  const postInfo = (thread) => {
    if (!thread.posts) return null;
    return (
      <div className="small-font">
        <span>
          Posts: <b>{thread.posts.length}</b>
        </span>
        {` | Last post was about ${format(
          new Date(thread.lastActive)
        )} ago by ${lastCommenter(thread)}`}
      </div>
    );
  };

  // Handles events when the delete button is called.
  const deleteHandler = async (threadID) => {
    // eslint-disable-next-line no-restricted-globals
    const confirmDelete = confirm("Are you sure?"); // eslint-disable-line no-alert
    if (!confirmDelete) return;

    try {
      await wso.bulletinService.deleteDiscussion(threadID);

      loadThreads(page);
    } catch (error) {
      navigateTo("/error", { replace: true, state: { error } });
    }
  };

  // Generates the delete button if admin or thread starter
  const deleteButton = (thread) => {
    if (currUser && (currUser.admin || currUser.id === thread.userID)) {
      return (
        <div>
          <button
            className="inline-button"
            type="button"
            onClick={() => deleteHandler(thread.id)}
          >
            Delete
          </button>
        </div>
      );
    }

    return null;
  };

  const discussion = (thread) => {
    return (
      <div className="comment" key={thread.id}>
        {threadTitle(thread)}
        {startedBy(thread)}
        {postInfo(thread)}

        {deleteButton(thread)}
      </div>
    );
  };

  const discussionSkeleton = (key) => (
    <div className="comment" key={key}>
      <h5>
        <Line width="35%" />
      </h5>
      <div className="small-font">
        <Line width="30%" />
      </div>
      <div className="small-font">
        <Line width="40%" />
      </div>
    </div>
  );

  return (
    <section className="margin-vertical-small">
      <PaginationButtons
        selectionHandler={selectionHandler}
        clickHandler={clickHandler}
        page={page}
        total={total}
        perPage={perPage}
        showPages
      />
      {threads
        ? threads.map((thread) => discussion(thread))
        : [...Array(20)].map((_, i) => discussionSkeleton(i))}

      <PaginationButtons
        selectionHandler={selectionHandler}
        clickHandler={clickHandler}
        page={page}
        total={total}
        perPage={perPage}
        showPages
      />
      <br />
    </section>
  );
};

export default DiscussionIndex;
