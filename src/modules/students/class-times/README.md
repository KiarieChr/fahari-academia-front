# Timetable Module - Frontend Documentation

## Overview

This module provides a comprehensive timetable management interface for the Fahari Academia system. It integrates with the Django backend's enhanced timetabling APIs to deliver real-time conflict checking, work allocation-based assignment, and semi-automatic schedule generation.

## Directory Structure

```
src/modules/students/class-times/
├── ClassTimesDashboard.jsx       # Main dashboard container
├── components/
│   ├── ClassTimesFilterBar.jsx   # Class/session filter controls
│   ├── ClassTimesOverview.jsx    # Dashboard metrics overview
│   ├── ConflictPanel.jsx         # Conflict display panel
│   ├── RoomAllocationView.jsx    # Room management view
│   ├── SlotAssignmentModal.jsx   # NEW: Enhanced slot assignment modal
│   ├── TeacherScheduleView.jsx   # Teacher schedule view
│   ├── TimeSlotsManagement.jsx   # Time slots CRUD
│   ├── WeeklyTimetable.jsx       # ENHANCED: Interactive timetable grid
│   └── index.js                  # Component exports
├── hooks/
│   └── useTimetableData.js       # ENHANCED: Central data hook with caching
└── services/
    ├── timetableApi.js           # NEW: Dedicated API service layer
    └── index.js                  # Service exports
```

## Key Components

### WeeklyTimetable.jsx

The main timetable grid component with interactive features:

**Props:**
- `weeklyView` - Object keyed by day_of_week (0-6) → array of slots
- `slots` - Flat array of all slots (for deriving time columns)
- `periods` - Time period definitions from backend
- `onEditSlot(slot)` - Callback when clicking a slot to edit
- `onDeleteSlot(slot)` - Callback when deleting a slot
- `onAssignSlot({day_of_week, start_time, end_time})` - Callback for new slot
- `isLocked` - Whether editing is disabled
- `conflicts` - Array of slot IDs that have conflicts (shown with red highlight)

**Features:**
- Memoized cell components for performance
- Hover tooltips with lesson details
- Edit/Delete dropdown menu per cell
- Conflict highlighting (red ring indicator)
- Break/Lunch period handling
- Sticky day headers for scrolling
- Dark mode support

### SlotAssignmentModal.jsx

Enhanced modal for creating/editing timetable slots:

**Props:**
- `isOpen` / `onClose` - Modal visibility controls
- `slot` - Existing slot object for editing (null for new)
- `defaultValues` - Pre-filled day/time for new slots
- `classSessionId` - Current class session ID
- `subjects` / `teachers` / `rooms` - Available entities
- `workAllocations` - Teacher-subject assignments for filtering
- `onSave(slotData)` / `onDelete(slot)` - CRUD callbacks

**Features:**
- Subject dropdown filtered by work allocations
- Auto-fills teacher based on allocation
- Real-time conflict validation (debounced 300ms)
- Teacher availability preview indicator
- Hard conflict blocking (cannot save with hard conflicts)
- Loading states and error feedback

## API Service Layer

### TimetableApiService (`services/timetableApi.js`)

Static class providing all timetable API operations:

```javascript
import { TimetableApiService } from './services/timetableApi';

// Fetch class timetable (cached)
const data = await TimetableApiService.getClassTimetable(classSessionId);

// Check conflicts before saving
const result = await TimetableApiService.checkConflict({
    class_session: 1,
    subject: 5,
    teacher: 3,
    room: 2,
    day_of_week: 0,
    start_time: '08:00',
    end_time: '08:45',
    exclude_slot_id: existingSlotId, // for edits
});

// Create slot with conflict check
const newSlot = await TimetableApiService.createSlot(data, false);

// Generate timetable (semi-automatic)
await TimetableApiService.generateTimetable({
    class_session_id: 1,
    strategy: 'greedy',
});

// Clear cache when needed
TimetableApiService.clearCache();
```

**Methods:**
| Method | Description |
|--------|-------------|
| `getClassTimetable(id)` | Fetch full timetable for a class (cached) |
| `checkConflict(slotData)` | Pre-validate slot for conflicts |
| `checkConflictsBatch(slotsArray)` | Batch conflict check |
| `createSlot(data, skipCheck)` | Create new slot with optional conflict check |
| `updateSlot(id, data, skipCheck)` | Update slot with optional conflict check |
| `deleteSlot(id)` | Delete a slot |
| `getWorkAllocations(classId)` | Get teacher-subject assignments |
| `getTeacherAvailability(id, day)` | Get teacher's availability |
| `generateTimetable(options)` | Trigger semi-auto generation |
| `getTeacherFullTimetable(id)` | Get teacher's full schedule |
| `clearCache()` | Invalidate cached data |

## Data Hook

### useTimetableData(filters)

Central React hook for timetable state management:

```javascript
const {
    // Data
    subjects, rooms, classSessions, exceptions, teachers,
    weeklyView, slots, workAllocations, conflictErrors,
    
    // Status
    loading, error,
    
    // Actions
    refresh,
    createSlot, updateSlot, deleteSlot,
    createSlotWithConflictCheck, updateSlotWithConflictCheck,
    createSubject, updateSubject, deleteSubject,
    createRoom, updateRoom, deleteRoom,
    loadWorkAllocations, loadTeacherAvailability,
    clearConflictErrors,
} = useTimetableData({ classSessionId: 1 });
```

**Features:**
- Automatic data fetching on filter change
- In-memory caching via TimetableApiService
- Optimistic updates with rollback on failure
- Toast notifications for success/error feedback
- Conflict checking integration

## Backend API Endpoints

The frontend expects these endpoints (implemented in Django backend):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/timetable/slots/` | GET/POST | List/create slots |
| `/api/timetable/slots/{id}/` | GET/PUT/DELETE | Slot detail |
| `/api/timetable/slots/check-conflict/` | POST | Pre-validate conflicts |
| `/api/timetable/class/{id}/full/` | GET | Full class timetable |
| `/api/timetable/teacher/{id}/full/` | GET | Full teacher schedule |
| `/api/timetable/generate/` | POST | Semi-auto generation |
| `/api/timetable/work-allocations/` | GET | Teacher assignments |
| `/api/timetable/teacher-availability/` | GET | Teacher availability |
| `/api/timetable/analytics/{report}/` | GET | Analytics reports |

## Usage Example

```jsx
import React from 'react';
import { WeeklyTimetable, SlotAssignmentModal } from './components';
import useTimetableData from './hooks/useTimetableData';

const MyTimetableView = ({ classSessionId }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    
    const {
        weeklyView, slots, subjects, teachers, rooms,
        workAllocations, conflictErrors,
        createSlotWithConflictCheck, updateSlotWithConflictCheck, deleteSlot,
    } = useTimetableData({ classSessionId });
    
    return (
        <>
            <WeeklyTimetable
                weeklyView={weeklyView}
                slots={slots}
                onEditSlot={(slot) => { setEditingSlot(slot); setModalOpen(true); }}
                onDeleteSlot={(slot) => deleteSlot(slot.id)}
                onAssignSlot={(defaults) => { setEditingSlot(null); setModalOpen(true); }}
                conflicts={conflictErrors.map(e => e.slotId).filter(Boolean)}
            />
            
            <SlotAssignmentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                slot={editingSlot}
                classSessionId={classSessionId}
                subjects={subjects}
                teachers={teachers}
                rooms={rooms}
                workAllocations={workAllocations}
                onSave={async (data) => {
                    if (data.id) {
                        await updateSlotWithConflictCheck(data.id, data);
                    } else {
                        await createSlotWithConflictCheck(data);
                    }
                    setModalOpen(false);
                }}
            />
        </>
    );
};
```

## Conflict Types

The system distinguishes between:

1. **Hard Conflicts** (blocking)
   - Teacher double-booking
   - Room double-booking
   - Same subject twice in a day

2. **Soft Conflicts** (warnings)
   - Exceeds recommended periods per day
   - Teacher workload imbalance
   - Sub-optimal room assignment

Hard conflicts prevent saving; soft conflicts show warnings but allow saving.

## Performance Optimizations

1. **Memoization**: Components use `React.memo` and `useMemo` for expensive computations
2. **Caching**: API responses cached in-memory by class session ID
3. **Optimistic Updates**: UI updates immediately, reverts on API failure
4. **Debouncing**: Conflict checks debounced at 300ms to reduce API calls
5. **Lazy Loading**: Work allocations and teacher availability loaded on-demand

## Styling

All components use Tailwind CSS with:
- Dark mode support via `dark:` prefix
- Responsive design with `sm:`, `md:` breakpoints
- CSS animations via `animate-in` utilities
- Consistent spacing and visual hierarchy
