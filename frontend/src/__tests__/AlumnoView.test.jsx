import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AlumnoView from '../components/dashboard/AlumnoView';

describe('AlumnoView', () => {
  it('renders student content', () => {
    render(<AlumnoView />);

    expect(screen.getByText(/mis proyectos/i)).toBeInTheDocument();
    expect(screen.getByText(/carcasa sensor stl/i)).toBeInTheDocument();
    expect(screen.getByText(/estado de impresión/i)).toBeInTheDocument();
    expect(screen.getByText(/72% completado/i)).toBeInTheDocument();
  });
});
