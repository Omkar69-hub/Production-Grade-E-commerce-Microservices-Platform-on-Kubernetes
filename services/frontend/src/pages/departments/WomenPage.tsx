import React from 'react';
import { DepartmentPageLayout } from '../../components/department/DepartmentPageLayout';
import { DEPARTMENT_CONFIGS } from '../../data/departmentConfig';

export const WomenPage: React.FC = () => {
  return <DepartmentPageLayout config={DEPARTMENT_CONFIGS.women} />;
};

export default WomenPage;

