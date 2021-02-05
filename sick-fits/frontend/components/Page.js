import PropTypes from 'prop-types';
import Header from './Header';

export default function Page({ children }) {
  return (
    <div>
      <Header />
      <p>I am on the page component</p>
      {children}
    </div>
  );
}

Page.propTypes = {
  children: PropTypes.any,
};
