import { Container } from '@/components/common/container';

export default function TermsConditionsPage() {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
        <div className="prose max-w-none">
          <p className="text-muted-foreground mb-4">
            These terms and conditions govern your use of Nimto and our services.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing and using Nimto, you accept and agree to be bound by the terms and 
            provision of this agreement.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Use License</h2>
          <p className="text-muted-foreground mb-4">
            Permission is granted to temporarily download one copy of Nimto for personal, 
            non-commercial transitory viewing only.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
          <p className="text-muted-foreground mb-4">
            The materials on Nimto are provided on an 'as is' basis. Nimto makes no warranties, 
            expressed or implied, and hereby disclaims and negates all other warranties.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
          <p className="text-muted-foreground mb-4">
            In no event shall Nimto or its suppliers be liable for any damages arising out of 
            the use or inability to use the materials on Nimto.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Accuracy of Materials</h2>
          <p className="text-muted-foreground mb-4">
            The materials appearing on Nimto could include technical, typographical, or 
            photographic errors. Nimto does not warrant that any of the materials are accurate, 
            complete, or current.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
          <p className="text-muted-foreground mb-4">
            Nimto may revise these terms of service at any time without notice. By using this 
            service, you are agreeing to be bound by the then current version of these terms.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these terms and conditions, please contact us at 
            legal@nimto.app
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </Container>
  );
}
