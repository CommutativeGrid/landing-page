# Ladder Invariants Project Landing Page

This repository contains the landing page for the Ladder Invariants project, which corresponds to the paper **[Refinement of Interval Approximations for Fully Commutative Quivers](https://link.springer.com/article/10.1007/s13160-025-00739-w)**. 

View the live site at [ladder-invariants.netlify.app](https://ladder-invariants.netlify.app/).

## Technology Stack

- **Webpage Structure and Content Management**: 
  - **HTML**: Forms the basic structure and content of the webpage.
  - **JavaScript**: Used for enhancing the webpage with interactive and dynamic features.

- **Styling and Design**:
  - **CSS**: Manages the visual presentation and layout of the website.
  - **TailwindCSS**: A utility-first CSS framework utilized for rapid and responsive UI development.

- **Asset Management and Bundling**:
  - **Parcel**: Employed as a web application bundler, handling the compilation and efficient management of assets like CSS, JavaScript, and images.

- **Deployment and Hosting**:
  - **Netlify**: Provides hosting services for the website, with automated deployment capabilities linked to the GitHub repository.


### Repository Structure

- `src/index.html`: The main HTML file with the website's content.
- `src/courses.html`: The HTML file for the courses page.
- `src/css/`: Contains CSS files, including TailwindCSS configurations.
- `src/js/`: Contains JavaScript files.
- `src/static/`: Static resources like images and additional media.

### Local Development

1. Clone the repository to your local machine.
2. Install dependencies with `npm install`. Verified compatibility with Node.js v20.7.0.
3. Run `npm run start` to start a local development server.
4. Make changes as needed and test them in real-time.

### Publishing Changes

1. Commit your changes to the repository.
2. Push the commit to GitHub.
3. Netlify will automatically detect the changes and redeploy the site.