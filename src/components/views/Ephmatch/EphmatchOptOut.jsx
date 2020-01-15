// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Redux/routing imports
import { connect } from "react-redux";
import { getToken } from "../../../selectors/auth";
import { actions } from "redux-router5";

// Additional imports
import { checkAndHandleError } from "../../../lib/general";
import {
  getSelfEphmatchProfile,
  deleteEphmatchProfile,
} from "../../../api/ephmatch";

// Page created to handle both opting in and out.
const EphmatchOptOut = ({ token, navigateTo }) => {
  // Note that this is different from Ephcatch
  const [optOut, updateOptOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Check if there is an ephmatch profile for the user
    const loadEphmatchProfile = async () => {
      const ownProfile = await getSelfEphmatchProfile(token);
      if (checkAndHandleError(ownProfile) && isMounted) {
        updateOptOut(ownProfile.data.deleted);
      }
    };

    loadEphmatchProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const submitHandler = async (event) => {
    event.preventDefault();

    const response = await deleteEphmatchProfile(token);

    // Update succeeded -> redirect them to main ephmatch page.
    if (checkAndHandleError(response)) {
      navigateTo("ephmatch", { profile: response.data.data }, { reload: true });
    }
  };

  return (
    <div className="article">
      <section>
        <article>
          <p>
            Ephmatch is an exclusive feature for a limited time created to spark
            encounters between yourself and other Ephs. Choosing to opt out
            means you cannot select fellow Ephs or view matches. Your picture
            and name will also not be shown to other users. You may opt back in
            at anytime.
            <br />
          </p>
          <br />

          <form onSubmit={submitHandler}>
            <h3>Opting Out</h3>
            <br />
            <b>
              This is entirely optional - we respect your wishes, and you will
              not be added into the Ephmatch system should you choose to opt
              out.
            </b>
            <br />
            <br />
            <input
              type="checkbox"
              onChange={(event) => updateOptOut(event.target.checked)}
              defaultChecked={optOut}
            />
            I want to opt out of Ephmatch.
            <br />
            <br />
            <br />
            <input type="submit" value="Save" data-disable-with="Save" />
          </form>
        </article>
      </section>
    </div>
  );
};

EphmatchOptOut.propTypes = {
  token: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
};

EphmatchOptOut.defaultProps = {};

const mapStateToProps = (state) => ({
  token: getToken(state),
});

const mapDispatchToProps = (dispatch) => ({
  navigateTo: (location, params, opts) =>
    dispatch(actions.navigateTo(location, params, opts)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EphmatchOptOut);