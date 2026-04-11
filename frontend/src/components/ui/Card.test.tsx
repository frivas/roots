import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from './Card';

describe('Card compound components', () => {
  it('renders Card wrapper', () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('renders CardHeader', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders CardTitle', () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders CardDescription', () => {
    render(<CardDescription>Some description</CardDescription>);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('renders CardContent', () => {
    render(<CardContent data-testid="content">Body text</CardContent>);
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders CardFooter', () => {
    render(<CardFooter data-testid="footer">Footer text</CardFooter>);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-card" data-testid="card">content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom-card');
  });

  it('renders all sub-components together', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByTestId('full-card')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
