import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProfesorView from '../components/dashboard/ProfesorView';

describe('ProfesorView', () => {
  it('renders professor content', () => {
    render(<ProfesorView />);

    expect(screen.getByText(/mis cursos/i)).toBeInTheDocument();
    expect(screen.getByText(/curso programación 3/i)).toBeInTheDocument();
    expect(screen.getByText(/proyectos de alumnos/i)).toBeInTheDocument();
    expect(screen.getByText(/proyecto brazo robótico/i)).toBeInTheDocument();
  });
});
