# Task Manager Premium

A world-class mobile task management application built with React Native and Expo, featuring glassmorphism design, sophisticated gesture interactions, spring-based animations, and enterprise-grade architecture. Task Manager Premium delivers an exceptional user experience through visual polish, fluid interactions, and robust engineering.

## Features

### Core Task Management

- **Enhanced Task Creation**: Add tasks with priority levels, due dates, and tags
- **Smart Task Organization**: Multiple views (Today, Upcoming, High Priority, Completed)
- **Inline Editing**: Edit task attributes without context switching
- **Drag-to-Reorder**: Intuitive task reordering with visual feedback

### Visual Design

- **Glassmorphism Effects**: Frosted glass surfaces with dynamic blur and translucency
- **Design Token System**: Consistent visual language with centralized design constants
- **Dynamic Theming**: Light, dark, and high contrast themes with animated transitions
- **Priority Visual Coding**: Color-coded priority levels for quick identification
- **Adaptive Performance**: Graceful degradation on low-end devices

### Interactions & Animations

- **Spring-Based Animations**: Natural, physics-based motion for all interactions
- **Gesture Controls**: Swipe-to-complete, swipe-to-reveal, long-press gestures
- **Velocity-Aware Gestures**: Intelligent gesture completion based on swipe speed
- **Haptic Feedback**: Tactile responses for key interactions
- **Micro-Interactions**: Subtle animations that enhance user experience

### Accessibility

- **Screen Reader Support**: Complete VoiceOver and TalkBack compatibility
- **Dynamic Font Scaling**: Respects system text size settings
- **Reduced Motion**: Automatically adapts animations for accessibility
- **High Contrast Mode**: Automatic theme switching for better visibility
- **WCAG AA Compliance**: All color combinations meet accessibility standards
- **Touch Target Sizes**: All interactive elements meet 44x44 point minimum

### Architecture & Quality

- **Reducer-Based State**: Predictable, centralized state management
- **Type Safety**: Strict TypeScript with no implicit any types
- **Performance Optimized**: 60fps animations with aggressive memoization
- **Defensive Engineering**: Comprehensive error handling and validation
- **Property-Based Testing**: Formal correctness verification
- **Enterprise-Grade Code**: Clean architecture with clear separation of concerns

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm**: Comes with Node.js (version 9.x or higher)
  - Verify installation: `npm --version`

- **Expo CLI**: For running the development server
  - Install globally: `npm install -g expo-cli`
  - Or use with npx (no global install needed)

- **Mobile Development Environment** (choose one):
  - **iOS**: Xcode (macOS only) or Expo Go app on iOS device
  - **Android**: Android Studio or Expo Go app on Android device
  - **Web**: Modern web browser (Chrome, Firefox, Safari)

## Installation

1. **Clone or navigate to the project directory**:

   ```bash
   cd task-manager
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   This will install all required packages including:
   - React Native and Expo SDK
   - TypeScript and type definitions
   - Testing libraries (Jest, React Native Testing Library, fast-check)
   - Development tools (ESLint, Prettier)

## Running the Application

### Start the Development Server

```bash
npm start
```

### Run on Specific Platforms

**iOS Simulator** (macOS only):

```bash
npm run ios
```

**Android Emulator**:

```bash
npm run android
```

**Web Browser**:

```bash
npm run web
```

### Using Expo Go App

1. Install Expo Go on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code displayed in your terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Development

### Running Tests

**Run all tests**:

```bash
npm test
```

**Run tests in watch mode**:

```bash
npm run test:watch
```

**Run tests with coverage**:

```bash
npm run test:coverage
```

### Code Quality

**Lint code**:

```bash
npm run lint
```

**Fix linting issues automatically**:

```bash
npm run lint:fix
```

**Format code**:

```bash
npm run format
```

**Check formatting**:

```bash
npm run format:check
```

## Architecture

### High-Level Architecture

Task Manager Premium follows a reducer-based architecture with unidirectional data flow:

```
┌─────────────────────────────────────────────────────────┐
│                    App Container                        │
│              (Theme Provider, State Provider)           │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌───▼────────┐ ┌───▼──────────┐
│  Theme Context  │ │   State    │ │   Gesture    │
│   (Dynamic)     │ │  Reducer   │ │   Handler    │
└─────────────────┘ └────┬───────┘ └──────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌───▼────────┐ ┌───▼──────────┐
│   Smart Views   │ │  Task List │ │  Task Input  │
│   (Derived)     │ │ (Animated) │ │ (Enhanced)   │
└─────────────────┘ └────┬───────┘ └──────────────┘
                         │
                  ┌──────▼──────┐
                  │  Task Item  │
                  │ (Gestures + │
                  │  Animation) │
                  └─────────────┘
```

### Component Hierarchy

1. **App Container**: Root component with providers (Theme, State)
2. **ViewSelector**: Navigation between smart views
3. **TaskList**: Animated, gesture-enabled list with glassmorphism
4. **TaskItem**: Individual task with swipe gestures, animations, glass effects
5. **TaskInput**: Enhanced input with inline editing capabilities
6. **UI Primitives**: Reusable components (GlassCard, AnimatedButton, SwipeableRow)

### State Management Architecture

The application uses a reducer pattern for predictable, centralized state management.

### Data Flow

1. User interacts with components (TaskInput, TaskItem, ViewSelector)
2. Event handlers dispatch actions to the reducer
3. Reducer computes new state immutably
4. State changes propagate to components via context
5. Memoized selectors derive computed state (smart views)
6. Components re-render only when their dependencies change

### Smart Views

Smart views are derived from the task state using memoized selectors:

- **Today View**: Tasks due today or overdue
- **Upcoming View**: Tasks due in the next 7 days
- **High Priority View**: Tasks with high or critical priority
- **Completed View**: All completed tasks
- **All Tasks View**: Complete task list

Views are computed on-demand and cached for performance.

## Third-Party Libraries

### Core Dependencies

- **expo** (~54.0.32): Development platform and build tooling
- **react** (19.1.0): UI library for building components
- **react-native** (0.81.5): Framework for building native mobile apps
- **react-native-reanimated** (^3.16.7): High-performance animations
- **react-native-gesture-handler** (^2.22.1): Native gesture recognition
- **expo-blur** (~14.0.4): Glassmorphism blur effects
- **expo-haptics** (~14.0.1): Haptic feedback
- **expo-status-bar** (~3.0.9): Status bar component

### Development Dependencies

#### Testing

- **jest** (^30.2.0): Test runner and assertion library
- **jest-expo** (^54.0.16): Jest preset for Expo projects
- **@testing-library/react-native** (^13.3.3): Testing utilities for React Native
- **@testing-library/jest-native** (^5.4.3): Custom matchers for React Native
- **fast-check** (^4.5.3): Property-based testing library
- **react-test-renderer** (^19.2.4): React renderer for testing

#### TypeScript

- **typescript** (~5.9.2): TypeScript compiler
- **@types/react** (~19.1.0): Type definitions for React
- **@types/jest** (^30.0.0): Type definitions for Jest

#### Code Quality

- **eslint** (^9.39.2): JavaScript/TypeScript linter
- **@typescript-eslint/eslint-plugin** (^8.54.0): TypeScript-specific linting rules
- **@typescript-eslint/parser** (^8.54.0): TypeScript parser for ESLint
- **eslint-plugin-react** (^7.37.5): React-specific linting rules
- **eslint-plugin-react-native** (^5.0.0): React Native-specific linting rules
- **eslint-config-prettier** (^10.1.8): Disables ESLint rules that conflict with Prettier
- **eslint-plugin-prettier** (^5.5.5): Runs Prettier as an ESLint rule
- **prettier** (^3.8.1): Code formatter

### Theme System

The application supports three themes with animated transitions:

#### Light Theme

- Clean, bright interface for daytime use
- High contrast text on light backgrounds
- Vibrant accent colors
- Medium blur intensity for glassmorphism

#### Dark Theme

- Pure black background for OLED displays
- Reduced eye strain in low-light conditions
- Adjusted accent colors for dark backgrounds
- Medium blur intensity with dark tint

#### High Contrast Theme

- Maximum accessibility for users with low vision
- Pure black text on white backgrounds (21:1 contrast)
- Stronger borders and reduced blur
- All combinations exceed WCAG AAA standards

### Animated Theme Transitions

When switching themes, all colors and blur effects smoothly animate:

- **Duration**: 300ms (normal) or 150ms (reduced motion)
- **Interpolation**: Smooth color transitions using `interpolateColor`
- **Accessibility**: Respects system reduced motion setting
- **Performance**: 60fps animations on the UI thread

## Gesture Interactions

Task Manager Premium features sophisticated gesture-based interactions with velocity awareness.

### Swipe Gestures

**Swipe Right**: Toggle task completion

- Swipe right on any task to mark it complete/incomplete
- Visual feedback with spring animation
- Haptic feedback on completion

**Swipe Left**: Reveal action buttons

- Swipe left to reveal delete and edit actions
- Buttons appear with spring animation
- Tap outside to dismiss

**Velocity-Aware Completion**:

- Fast swipes (>500 points/sec) complete automatically
- Slow swipes require reaching minimum distance (50 points)
- Natural, intuitive interaction model

### Long-Press Gestures

**Long-Press on Task**: Enter multi-select mode

- Hold task for 500ms to activate
- Visual feedback with scale animation
- Haptic feedback on activation
- Selection checkboxes appear on all tasks

**Long-Press in Multi-Select**: Toggle selection

- Tap tasks to select/deselect
- Selected count displayed in action bar
- Batch operations available (complete, delete)

### Drag Gestures

**Drag-to-Reorder**: Rearrange task order

- Long-press and drag to reorder tasks
- Other tasks animate to make space
- Visual feedback shows dragged task
- Haptic feedback on position changes

### Gesture Conflict Resolution

When multiple gestures are possible, the system prioritizes:

1. Long-press (highest priority)
2. Swipe gestures
3. Tap gestures (lowest priority)

This ensures intuitive, predictable behavior without accidental activations.

## Accessibility Features

Task Manager Premium is designed for inclusivity with comprehensive accessibility support.

### Screen Reader Support

- **Complete VoiceOver/TalkBack compatibility**
- Descriptive labels for all interactive elements
- Contextual hints explaining actions
- Proper semantic roles (button, checkbox, header)
- Dynamic state announcements

### Dynamic Font Scaling

- Respects system text size settings
- Typography scales from 75% to 200%
- Layouts adapt without breaking
- Consistent line height calculations

### Reduced Motion

- Detects system reduced motion setting
- Automatically simplifies animations
- Faster, less bouncy spring configurations
- Core functionality preserved

### High Contrast Mode

- Automatic theme switching when enabled
- Pure black text on white backgrounds
- Stronger borders for better definition
- All combinations exceed WCAG AAA standards

### Touch Target Sizes

- All interactive elements: 44x44 points minimum
- Exceeds iOS and Android accessibility guidelines
- Comfortable tapping for all users

## Performance Optimization

### Device Performance Detection

The application automatically detects device capabilities and adapts:

**High-End Devices**:

- Full blur intensity
- Complex spring animations
- All visual effects enabled

**Low-End Devices**:

- 50% blur reduction
- Simplified animations
- Visual hierarchy maintained

### Rendering Optimization

- **FlatList**: Efficient rendering with stable keys
- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Memoized event handlers
- **useMemo**: Cached derived state
- **Memoized Selectors**: Efficient view derivation

### Animation Performance

- **60fps target**: All animations maintain smooth frame rates
- **UI thread animations**: Using react-native-reanimated
- **Spring physics**: Natural, performant motion
- **Batch updates**: Minimizes layout thrashing

## Performance Considerations

The application is optimized for exceptional performance:

### Rendering Performance

- **FlatList**: Efficient rendering of large task lists with virtualization
- **React.memo**: Prevents unnecessary re-renders of components
- **useCallback**: Memoizes event handlers for referential equality
- **useMemo**: Caches expensive computations
- **Memoized Selectors**: Efficient derivation of smart views
- **Stable Keys**: Proper key management for list items

### Animation Performance

- **60fps Target**: All animations maintain smooth frame rates
- **UI Thread**: Animations run on native UI thread via reanimated
- **Spring Physics**: Natural, performant motion
- **Batch Updates**: Minimizes layout thrashing
- **Gesture Response**: <16ms response time for 60fps

### Adaptive Performance

- **Device Detection**: Automatically classifies device capabilities
- **Graceful Degradation**: Reduces effects on low-end devices
- **Blur Adaptation**: 50% reduction on low-end hardware
- **Animation Simplification**: Faster, less complex on low-end devices
- **Visual Hierarchy**: Maintained across all device tiers

### Memory Management

- **Efficient State**: Immutable updates prevent memory leaks
- **Component Cleanup**: Proper cleanup of timers and listeners
- **Gesture Handlers**: Native gesture recognition reduces overhead
- **Cached Computations**: Memoization reduces redundant work

## Future Enhancements

Potential features for future versions:

### Persistence & Sync

- Task persistence with AsyncStorage
- Cloud synchronization
- Offline-first architecture
- Conflict resolution

### Advanced Features

- Subtasks and task hierarchies
- Recurring tasks
- Task templates
- Custom views and filters
- Search functionality
- Task notes and attachments

### Collaboration

- Shared task lists
- Real-time collaboration
- Task assignment
- Comments and mentions

### Integrations

- Calendar integration
- Reminders and notifications
- Email integration
- Third-party app connections

### Analytics

- Productivity insights
- Completion trends
- Time tracking
- Goal setting and tracking

## License

This project is public.

## Contributing

This is a demonstration project. Contributions are not currently accepted.