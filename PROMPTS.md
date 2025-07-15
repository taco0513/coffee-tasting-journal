# AI Prompts Template

## Development Prompts

### Code Generation
```
Generate a React Native component for [component name] with the following requirements:
- TypeScript with proper types
- Zustand state management integration
- Korean language support
- Responsive design for mobile
- Accessibility features

Component should:
[specific requirements]

Use the existing project structure and follow these conventions:
- Use hooks for state management
- Include proper error handling
- Add loading states where appropriate
- Follow the existing styling patterns
```

### Database Schema
```
Create a Realm schema for [entity name] with the following fields:
[field list]

Requirements:
- Primary key: id (string)
- Timestamps: createdAt, updatedAt
- Relationships: [specify relationships]
- Validation: [validation rules]
- Indexes: [performance indexes]

Follow the existing schema patterns in the project.
```

### State Management
```
Add a new Zustand store action for [action name] that:
- Accepts parameters: [parameter list]
- Updates state: [state changes]
- Handles errors: [error handling]
- Integrates with Realm: [database operations]

Follow the existing store patterns and include proper TypeScript types.
```

## Feature Implementation

### Screen Creation
```
Create a new screen [ScreenName] for the coffee tasting app with:

UI Elements:
- [list UI elements]

Functionality:
- [list functionality]

Navigation:
- From: [source screen]
- To: [destination screen]
- Parameters: [navigation parameters]

Use the existing design system and Korean language support.
```

### Algorithm Implementation
```
Implement a [algorithm name] for coffee tasting analysis that:

Input:
- [input parameters]

Processing:
- [processing steps]

Output:
- [output format]

Requirements:
- Support Korean and English text
- Handle edge cases: [list edge cases]
- Optimize for mobile performance
- Include comprehensive error handling
```

### Data Migration
```
Create a Realm migration script for version [version] that:

Changes:
- [list schema changes]

Migration Steps:
- [migration steps]

Validation:
- [validation checks]

Rollback Plan:
- [rollback strategy]

Ensure data integrity and backward compatibility.
```

## Testing Prompts

### Unit Tests
```
Write comprehensive unit tests for [component/function name] using Jest that cover:

Test Cases:
- [list test cases]

Mock Dependencies:
- [list dependencies to mock]

Edge Cases:
- [list edge cases]

Include setup, teardown, and proper assertions.
```

### Integration Tests
```
Create integration tests for [feature name] that test:

User Flow:
- [step-by-step user flow]

Data Flow:
- [data flow verification]

Error Scenarios:
- [error conditions]

Use Detox for end-to-end testing.
```

## Documentation Prompts

### API Documentation
```
Generate API documentation for [module name] including:

Functions:
- [list functions]

Types:
- [list types]

Examples:
- [usage examples]

Error Handling:
- [error types and responses]

Format as markdown with proper TypeScript syntax highlighting.
```

### User Guide
```
Create a user guide section for [feature name] that explains:

Overview:
- [feature description]

Step-by-step Instructions:
- [numbered steps]

Tips and Tricks:
- [helpful hints]

Troubleshooting:
- [common issues and solutions]

Write in clear, user-friendly language with screenshots where helpful.
```

## Debugging Prompts

### Error Analysis
```
Analyze this error in the React Native coffee tasting app:

Error Message:
[error message]

Stack Trace:
[stack trace]

Context:
[when/where error occurs]

Expected Behavior:
[what should happen]

Provide:
1. Root cause analysis
2. Immediate fix
3. Prevention strategies
4. Testing recommendations
```

### Performance Optimization
```
Optimize [component/function name] for better performance:

Current Issues:
- [performance issues]

Metrics:
- [current metrics]

Constraints:
- [mobile device limitations]

Provide:
1. Bottleneck identification
2. Optimization strategies
3. Code improvements
4. Measurement techniques
```

## Localization Prompts

### Korean Translation
```
Translate these UI strings to Korean for the coffee tasting app:

English Strings:
[list of strings]

Requirements:
- Use appropriate coffee terminology
- Match the app's friendly tone
- Consider mobile screen space
- Include cultural context where relevant

Provide both Korean text and romanization for verification.
```

### Cultural Adaptation
```
Adapt this feature for Korean users:

Feature:
[feature description]

Cultural Considerations:
- [cultural factors]

Localization Needs:
- [specific adaptations]

Provide recommendations for UI, UX, and content modifications.
```

## Deployment Prompts

### Build Configuration
```
Create build configuration for [environment] deployment:

Environment:
- [environment details]

Requirements:
- [build requirements]

Security:
- [security considerations]

Performance:
- [performance optimizations]

Include scripts, environment variables, and deployment steps.
```

### Release Management
```
Prepare release notes for version [version number]:

New Features:
- [feature list]

Bug Fixes:
- [bug fixes]

Improvements:
- [improvements]

Breaking Changes:
- [breaking changes]

Known Issues:
- [known issues]

Format for both technical and user-facing audiences.
```

## Maintenance Prompts

### Code Review
```
Review this code for the coffee tasting app:

Code:
[code snippet]

Check for:
- Code quality and standards
- TypeScript type safety
- Performance considerations
- Security issues
- Accessibility compliance
- Korean language support

Provide specific feedback and improvement suggestions.
```

### Refactoring
```
Refactor [component/module name] to improve:

Current Issues:
- [list issues]

Goals:
- [refactoring goals]

Constraints:
- [constraints to consider]

Provide:
1. Refactoring plan
2. Step-by-step implementation
3. Testing strategy
4. Migration guide
```

## Innovation Prompts

### Feature Enhancement
```
Enhance the coffee tasting app with [new feature concept]:

Concept:
[feature description]

User Value:
[value proposition]

Technical Approach:
[implementation approach]

Integration:
[how it fits with existing features]

Provide detailed specification and implementation plan.
```

### AI/ML Integration
```
Integrate [AI/ML capability] into the coffee tasting app:

Use Case:
[specific use case]

Data Requirements:
[data needed]

Algorithm:
[algorithm approach]

Performance:
[performance requirements]

Privacy:
[privacy considerations]

Provide architecture and implementation strategy.
```

## Prompt Usage Guidelines

### Best Practices
1. **Be Specific**: Include exact requirements and constraints
2. **Provide Context**: Reference existing code and patterns
3. **Include Examples**: Show expected input/output
4. **Consider Edge Cases**: Mention error conditions and limitations
5. **Specify Standards**: Reference coding standards and conventions

### Template Variables
- `[component name]`: React Native component
- `[screen name]`: App screen identifier
- `[feature name]`: Feature description
- `[version]`: Version number
- `[environment]`: Deployment environment
- `[error message]`: Specific error text
- `[code snippet]`: Code to analyze

### Response Format
- Use markdown formatting
- Include code blocks with syntax highlighting
- Provide step-by-step instructions
- Include TypeScript types
- Add Korean translations where relevant
- Consider mobile-first design principles