import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

describe('App', () => {
  it('renders FlowPilot landing', () => {
    render(<BrowserRouter><App /></BrowserRouter>);
    expect(document.body.textContent).toContain('FlowPilot');
  });
});
