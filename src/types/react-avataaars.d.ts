declare module 'react-avataaars' {
  import * as React from 'react';

  export interface AvataaarsProps extends React.SVGProps<SVGSVGElement> {
    avatarStyle?: 'Circle' | 'Transparent';
    topType?: string;
    accessoriesType?: string;
    hairColor?: string;
    facialHairType?: string;
    clotheType?: string;
    clotheColor?: string;
    eyeType?: string;
    eyebrowType?: string;
    mouthType?: string;
    skinColor?: string;
    [key: string]: any;
  }

  const Avataaars: React.FC<AvataaarsProps>;
  export default Avataaars;
}
