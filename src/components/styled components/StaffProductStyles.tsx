import styled from 'styled-components';
import { Card} from 'antd';

export const StyledHeader = styled.div`
  background: linear-gradient(to right, #7c3aed, #4f46e5) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  margin-bottom: 1.5rem !important;
  padding: 1.5rem !important;
`;

export const HeaderContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

export const LogoSection = styled.div`
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  margin-bottom: 1rem !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
    margin-bottom: 0 !important;
  }
`;

export const IconContainer = styled.div`
  background-color: white !important;
  padding: 0.75rem !important;
  border-radius: 9999px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  margin-right: 1rem !important;
  margin-bottom: 0.75rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }

  .anticon {
    font-size: 1.875rem !important;
    color: #7c3aed !important;
  }
`;

export const TitleContainer = styled.div`
  h1 {
    font-size: 1.875rem !important;
    font-weight: 700 !important;
    color: white !important;
    text-align: center !important;

    @media (min-width: 768px) {
      text-align: left !important;
    }
  }

  p {
    color: #ddd6fe !important;
    margin-top: 0.25rem !important;
    display: flex !important;
    align-items: center !important;
    text-align: center !important;

    @media (min-width: 768px) {
      text-align: left !important;
    }
  }
`;

export const SearchContainer = styled.div`
  width: 100% !important;

  @media (min-width: 768px) {
    width: auto !important;
  }

  .ant-input-search {
    width: 100% !important;

    @media (min-width: 768px) {
      width: 20rem !important;
    }
  }
`;

export const FilterSection = styled.div`
  background: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  padding: 1.5rem !important;
  margin-bottom: 1.5rem !important;
`;

export const FilterContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 1.5rem !important; // Increased from previous value
  
  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

export const Separator = styled.div`
  height: 1px !important;
  background-color: #e5e7eb !important;
  width: 100% !important;
  margin: 1rem 0 2rem 0 !important; // Add space above and below the separator
`;

export const FilterControls = styled.div`
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 1rem !important;
  margin-bottom: 1rem !important;

  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }
`;

export const ViewControls = styled.div`
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;

  span {
    color: #6b7280 !important;
  }

  .ant-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .ant-btn-primary {
    background-color: #7c3aed !important;
    border-color: #7c3aed !important;
  }
`;

export const StyledCard = styled(Card)`
  .ant-card-cover {
    width: 100% !important;
    height: 280px !important; // Fixed height for all images
    overflow: hidden !important;
  }
  
  .ant-card-body {
    width: 100% !important;
  }
  
  img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
`;