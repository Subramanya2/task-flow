import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskStatus, Priority } from "@prisma/client";

// Mock the icons to prevent SVG issues in jsdom
vi.mock("lucide-react", () => ({
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  MessageSquare: () => <div data-testid="message-icon" />,
  MoreVertical: () => <div data-testid="more-icon" />,
  Edit2: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  UserPlus: () => <div data-testid="user-plus-icon" />,
  CheckIcon: () => <div data-testid="check-icon" />,
}));

describe("TaskCard Component", () => {
  const mockTask = {
    id: "task-1",
    title: "Test Task Title",
    description: "Test description",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    dueDate: new Date("2030-01-01"),
    creatorId: "user-1",
    assigneeId: null,
    assigneeEmail: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: "user-1", name: "Creator User", email: "creator@test.com", image: null },
    assignee: null,
  };

  it("renders the task title and description", () => {
    render(<TaskCard task={mockTask} currentUserId="user-1" />);
    
    expect(screen.getByText("Test Task Title")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("displays the correct priority badge", () => {
    render(<TaskCard task={mockTask} currentUserId="user-1" />);
    
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("calls onStatusChange when the checkbox is clicked", () => {
    const handleStatusChange = vi.fn();
    render(
      <TaskCard 
        task={mockTask} 
        currentUserId="user-1" 
        onStatusChange={handleStatusChange} 
      />
    );
    
    // In our component, we render a custom Checkbox which ultimately uses radix primitive
    // The visual checkbox is an element with role="checkbox"
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    
    expect(handleStatusChange).toHaveBeenCalledWith("task-1", TaskStatus.COMPLETED);
  });
});
