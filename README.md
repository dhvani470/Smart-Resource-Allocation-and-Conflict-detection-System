# Smart Resource Allocation and Conflict Detection System

The Smart Resource Allocation and Conflict Detection System is a web-based application developed using HTML, CSS, JavaScript, and jQuery. It allows users to book shared resources such as computer labs, seminar halls, conference rooms, and projectors for specific time slots.

The project uses an **AVL-based Interval Tree** to detect overlapping booking intervals and prevent scheduling conflicts. Each resource has its own Interval Tree, with `maxEnd` values maintained to support interval overlap searches.

### Features
- Create bookings by specifying the user, resource, date, and time.
- Detect overlapping booking intervals.
- View bookings in a resource-wise schedule.
- Display all confirmed bookings.
- Cancel existing bookings.
- View booking statistics and today's bookings.
- Load example data for testing.

### Technologies Used
- HTML
- CSS
- JavaScript
- jQuery

### DAA Concepts
- AVL Trees
- Interval Trees
- Binary Search Trees
- Tree rotations and balancing
- Interval overlap detection
- Time and space complexity analysis

### Objective
The objective of this project is to apply data structures and algorithms to a practical resource scheduling problem by efficiently identifying overlapping time intervals and managing bookings.
