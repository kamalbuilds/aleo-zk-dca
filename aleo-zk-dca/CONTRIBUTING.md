# Contributing to ZK-DCA

Thank you for your interest in contributing to ZK-DCA! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aleo-zk-dca.git
   cd aleo-zk-dca
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix
2. Make your changes, following the code style of the project
3. Add tests for your changes
4. Make sure all tests pass
5. Submit a pull request

## Aleo Contract Development

When working on the Aleo contracts:

1. Modify the `.leo` files in the `contracts/` directory
2. Build the contracts using `leo build`
3. Test your changes using `leo run`

## Submitting Pull Requests

1. Include a clear description of the problem and solution
2. Include any relevant issue numbers
3. Include any necessary documentation updates
4. Make sure all CI checks pass

## Code Style

- Use 2 spaces for indentation
- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Add appropriate comments

## Documentation

If your PR adds new features, please update the documentation accordingly. This includes:

- README.md
- Code comments
- API documentation

## License

By contributing to ZK-DCA, you agree that your contributions will be licensed under the project's MIT license. 