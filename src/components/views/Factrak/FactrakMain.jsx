// React imports
import React from "react";
import PropTypes from "prop-types";

// Component imports
import FactrakHome from "./FactrakHome";
import FactrakPolicy from "./FactrakPolicy";
import FactrakModerate from "./FactrakModerate";
import FactrakLayout from "./FactrakLayout";
import FactrakAOS from "./FactrakAOS";

// Redux imports
import { connect } from "react-redux";
import { getToken } from "../../../selectors/auth";

// External Imports
import { createRouteNodeSelector } from "redux-router5";

const FactrakMain = ({ route }) => {
  const factrakBody = () => {
    const splitRoute = route.name.split(".");
    if (splitRoute.length === 1) return <FactrakHome />;

    switch (splitRoute[1]) {
      case "policy":
        return <FactrakPolicy />;
      case "surveys":
        // @TODO: update factrak sureys
        return <FactrakPolicy />;
      case "moderate":
        // @TODO: Update FactrakModerate
        return <FactrakModerate />;
      case "areasOfStudy":
        return <FactrakAOS />;
      default:
        return <FactrakHome />;
    }
  };

  return <FactrakLayout>{factrakBody()}</FactrakLayout>;
};

FactrakMain.propTypes = {
  route: PropTypes.object.isRequired,
};

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("factrak");

  return (state) => ({
    token: getToken(state),
    ...routeNodeSelector(state),
  });
};

export default connect(mapStateToProps)(FactrakMain);
