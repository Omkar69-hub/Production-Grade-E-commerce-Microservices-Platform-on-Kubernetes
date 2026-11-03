import React from 'react';
import { DepartmentPageLayout } from '../../components/department/DepartmentPageLayout';
import { DEPARTMENT_CONFIGS } from '../../data/departmentConfig';

export const StreetwearPage: React.FC = () => {
  return <DepartmentPageLayout config={DEPARTMENT_CONFIGS.streetwear} />;
};

export default StreetwearPage;

