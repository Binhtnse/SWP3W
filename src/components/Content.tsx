import { Content } from 'antd/es/layout/layout';
import React from 'react';
import styled from 'styled-components';

const StyledContent = styled(Content)`
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0 16px;
`;

export default function MyContent({ children }: { children: React.ReactNode }) {
  return (
    <StyledContent>
      <main className='h-full'>{children}</main>
    </StyledContent>
  );
} 