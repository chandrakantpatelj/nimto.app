import { Container } from '@/components/common/container';

export default function AboutUsPage() {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        
        <div className="prose max-w-none space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              At Nimto, we're dedicated to creating innovative solutions that help people 
              connect, collaborate, and achieve their goals. Our platform is designed to 
              streamline processes and enhance productivity for individuals and organizations alike.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="text-muted-foreground">
              Nimto provides a comprehensive suite of tools and services designed to meet 
              the diverse needs of our users. From event management to template creation, 
              we offer solutions that are both powerful and easy to use.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <ul className="text-muted-foreground space-y-2">
              <li><strong>Innovation:</strong> We continuously strive to improve and innovate our platform</li>
              <li><strong>User-Centric:</strong> Our users' needs and feedback drive our development</li>
              <li><strong>Quality:</strong> We maintain high standards in everything we do</li>
              <li><strong>Accessibility:</strong> We believe technology should be accessible to everyone</li>
              <li><strong>Security:</strong> We prioritize the security and privacy of our users</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-muted-foreground">
              Our team consists of passionate professionals who are committed to delivering 
              exceptional experiences. We combine technical expertise with creative thinking 
              to solve complex problems and create meaningful solutions.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
            <p className="text-muted-foreground">
              We're always looking for talented individuals to join our team. If you're 
              passionate about technology and want to make a difference, we'd love to 
              hear from you. Visit our careers page or contact us directly.
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> info@nimto.app</p>
              <p><strong>Support:</strong> support@nimto.app</p>
              <p><strong>Business:</strong> business@nimto.app</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
